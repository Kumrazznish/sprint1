import ApiKey from '../models/ApiKey.js';

export const MODEL_FLEET = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

/**
 * In-Memory Key Slot Representation for Zero-Latency Hot Path
 */
export class KeySlot {
  constructor(data) {
    this.id = data._id ? data._id.toString() : data.id;
    this.apiKey = data.apiKey; // Decrypted raw key
    this.maskedKey = data.maskedKey || ApiKey.maskKey(data.apiKey);
    this.name = data.name || 'Gemini Key';
    this.provider = data.provider || 'gemini';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.healthScore = data.healthScore !== undefined ? data.healthScore : 100;
    this.queuePosition = data.queuePosition || 0;
    this.rateLimit = data.rateLimit || 15; // 15 RPM standard tier
    this.softLimit = data.softLimit || Math.max(1, (data.rateLimit || 15) - 3); // Pre-emptive e.g. 12 RPM
    
    // In-Memory Concurrency Locks
    this.isOccupied = false;
    this.occupiedBy = null;
    this.occupiedSince = null;
    
    // Sliding 60-second window of request timestamps
    this.requestTimestamps = [];
    
    // Model Status Map
    this.modelStatuses = new Map();
    MODEL_FLEET.forEach(model => {
      const existing = data.modelStatuses?.get?.(model) || data.modelStatuses?.[model];
      this.modelStatuses.set(model, {
        status: existing?.status || 'HEALTHY',
        resetsAt: existing?.resetsAt ? new Date(existing.resetsAt) : null,
        failureCount: existing?.failureCount || 0,
        lastUsedAt: existing?.lastUsedAt ? new Date(existing.lastUsedAt) : null
      });
    });

    // Metrics counters
    this.totalRequests = data.totalRequests || 0;
    this.successfulRequests = data.successfulRequests || 0;
    this.failedRequests = data.failedRequests || 0;
    this.totalTokensUsed = data.totalTokensUsed || 0;
    this.latencies = [];
    this.avgLatencyMs = data.avgLatencyMs || 0;
    this.lastUsedAt = data.lastUsedAt ? new Date(data.lastUsedAt) : null;
    
    // Dirty flag for batch DB sync
    this.isDirty = false;
  }

  /**
   * Get clean RPM count over the last 60 seconds
   */
  getRequestsThisMinute() {
    const now = Date.now();
    const cutoff = now - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(t => t > cutoff);
    return this.requestTimestamps.length;
  }

  /**
   * Record a new request in the sliding window
   */
  recordRequest() {
    this.requestTimestamps.push(Date.now());
    this.totalRequests++;
    this.lastUsedAt = new Date();
    this.isDirty = true;
  }

  /**
   * Select best available model in the fleet for this key
   */
  getBestAvailableModel() {
    const now = new Date();
    for (const model of MODEL_FLEET) {
      const info = this.modelStatuses.get(model);
      if (!info) continue;

      // Auto-heal expired cooldowns
      if (info.status === 'RATE_LIMITED' && info.resetsAt && info.resetsAt <= now) {
        info.status = 'HEALTHY';
        info.resetsAt = null;
        info.failureCount = 0;
        this.isDirty = true;
      }

      if (info.status === 'HEALTHY') {
        return model;
      }
    }
    return null;
  }

  /**
   * Update model status on error
   */
  markModelStatus(model, status, cooldownSeconds = 60) {
    const info = this.modelStatuses.get(model) || { status: 'HEALTHY', failureCount: 0 };
    info.status = status;
    info.failureCount = (info.failureCount || 0) + 1;
    if (cooldownSeconds > 0) {
      info.resetsAt = new Date(Date.now() + cooldownSeconds * 1000);
    } else {
      info.resetsAt = null;
    }
    this.modelStatuses.set(model, info);
    this.isDirty = true;
  }

  /**
   * Adjust health score dynamically
   */
  adjustHealth(delta) {
    this.healthScore = Math.max(0, Math.min(100, this.healthScore + delta));
    this.isDirty = true;
  }

  /**
   * Record operation outcome
   */
  recordOutcome(success, latencyMs = 0, tokens = 0) {
    if (success) {
      this.successfulRequests++;
      this.adjustHealth(latencyMs < 2000 ? +2 : +1);
      if (tokens > 0) this.totalTokensUsed += tokens;
      if (latencyMs > 0) {
        this.latencies.push(latencyMs);
        if (this.latencies.length > 50) this.latencies.shift();
        const sum = this.latencies.reduce((a, b) => a + b, 0);
        this.avgLatencyMs = Math.round(sum / this.latencies.length);
      }
    } else {
      this.failedRequests++;
    }
    this.isDirty = true;
  }
}

/**
 * KeyPoolManager: Master In-Memory Pool Coordinator
 */
export class KeyPoolManager {
  static slots = new Map(); // Map<id, KeySlot>
  static isInitialized = false;
  static initPromise = null;

  /**
   * Pre-warm all active keys into memory at startup
   */
  static async initialize() {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        console.log('[KeyPoolManager] Pre-warming API Key pool from MongoDB...');
        
        let dbKeys = await ApiKey.find().select('+apiKey').lean().catch((err) => {
          console.warn('[KeyPoolManager] Could not fetch keys from DB:', err.message);
          return [];
        });
        
        const envKey = (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
        if (envKey && envKey.length > 10) {
          const existsInDb = dbKeys.some(k => k.apiKey === envKey);
          if (!existsInDb) {
            console.log('[KeyPoolManager] Seeding primary API key from environment config...');
            try {
              const seedDoc = await ApiKey.findOneAndUpdate(
                { apiKey: envKey },
                {
                  $set: {
                    apiKey: envKey,
                    maskedKey: ApiKey.maskKey(envKey),
                    name: 'Local Key (.env)',
                    provider: 'gemini',
                    isActive: true,
                    healthScore: 100,
                    queuePosition: 0,
                    rateLimit: 15,
                    softLimit: 12
                  }
                },
                { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
              ).lean();
              if (seedDoc) {
                dbKeys.unshift({ ...seedDoc, apiKey: envKey });
              }
            } catch (seedErr) {
              console.warn('[KeyPoolManager] Could not persist seed key to DB, loading in-memory only:', seedErr.message);
              dbKeys.unshift({
                _id: 'slot_primary_env',
                id: 'slot_primary_env',
                apiKey: envKey,
                maskedKey: ApiKey.maskKey(envKey),
                name: 'Local Key (.env)',
                provider: 'gemini',
                isActive: true,
                healthScore: 100,
                queuePosition: 0,
                rateLimit: 15,
                softLimit: 12
              });
            }
          }
        }

        // Populate In-Memory Slots
        this.slots.clear();
        dbKeys.forEach(keyDoc => {
          const slot = new KeySlot(keyDoc);
          this.slots.set(slot.id, slot);
        });

        this.isInitialized = true;
        console.log(`[KeyPoolManager] Successfully initialized ${this.slots.size} key slots in memory.`);
      } catch (err) {
        console.error('[KeyPoolManager] Critical initialization error:', err);
      }
    })();

    return this.initPromise;
  }

  /**
   * Acquire optimal available slot (Round-Robin with Pre-Emptive Soft Limits)
   */
  static async acquireSlot(userId = 'system', requiredProvider = 'gemini') {
    if (!this.isInitialized) await this.initialize();

    const now = Date.now();
    const candidateSlots = Array.from(this.slots.values()).filter(slot => {
      if (!slot.isActive) return false;
      if (slot.provider !== requiredProvider) return false;
      if (slot.isOccupied) return false;
      if (slot.healthScore <= 0) return false;

      // Soft rate limiting: Skip if current sliding RPM >= soft limit
      const currentRPM = slot.getRequestsThisMinute();
      if (currentRPM >= slot.softLimit) return false;

      // Must have at least one healthy/recoverable model
      const model = slot.getBestAvailableModel();
      return !!model;
    });

    if (candidateSlots.length === 0) {
      // Fallback: Check if any active key has room even if slightly above soft limit
      const fallbackSlots = Array.from(this.slots.values()).filter(slot => {
        if (!slot.isActive || slot.isOccupied) return false;
        return slot.getRequestsThisMinute() < slot.rateLimit && !!slot.getBestAvailableModel();
      });

      if (fallbackSlots.length > 0) {
        fallbackSlots.sort((a, b) => b.healthScore - a.healthScore || a.queuePosition - b.queuePosition);
        const selected = fallbackSlots[0];
        this.lockSlot(selected, userId);
        return { slot: selected, activeModel: selected.getBestAvailableModel() };
      }

      return null; // All keys saturated or on cooldown
    }

    // Sort by Health Score DESC, then Queue Position ASC (Fair Round-Robin)
    candidateSlots.sort((a, b) => {
      if (b.healthScore !== a.healthScore) {
        return b.healthScore - a.healthScore;
      }
      return a.queuePosition - b.queuePosition;
    });

    const selected = candidateSlots[0];
    this.lockSlot(selected, userId);
    const activeModel = selected.getBestAvailableModel();

    return { slot: selected, activeModel };
  }

  static recentEvents = [];

  /**
   * Lock slot in memory
   */
  static lockSlot(slot, userId) {
    slot.isOccupied = true;
    slot.occupiedBy = userId;
    slot.occupiedSince = new Date();
    slot.recordRequest();

    const event = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'OCCUPIED',
      keyName: slot.name,
      maskedKey: slot.maskedKey,
      user: userId,
      model: slot.getBestAvailableModel() || 'gemini-2.5-flash',
      details: `Key locked & in-flight for user ${userId}`
    };

    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 50) this.recentEvents.pop();
  }

  /**
   * Release slot back to pool and rotate queue position
   */
  static releaseSlot(slotId) {
    const slot = this.slots.get(slotId);
    if (!slot) return;

    slot.isOccupied = false;
    slot.occupiedBy = null;
    slot.occupiedSince = null;
    slot.queuePosition += 25; // Round-Robin rotation step
    slot.isDirty = true;

    const event = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'RELEASED',
      keyName: slot.name,
      maskedKey: slot.maskedKey,
      newQueuePosition: slot.queuePosition,
      details: `Key released. Queue rotated to position #${slot.queuePosition}`
    };

    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 50) this.recentEvents.pop();
  }

  /**
   * Acquire multiple distinct slots for multi-chunk batch execution
   */
  static async acquireBatchSlots(count, userId = 'batch-runner') {
    if (!this.isInitialized) await this.initialize();

    const acquired = [];
    for (let i = 0; i < count; i++) {
      const allocation = await this.acquireSlot(`${userId}-chunk-${i}`);
      if (allocation) {
        acquired.push(allocation);
      } else {
        break; // Max available slots reached
      }
    }
    return acquired;
  }

  /**
   * Add a new key dynamically to the pool
   */
  /**
   * Add a new key dynamically to the pool with Mongo and In-Memory resilience
   */
  static async addKey(keyData) {
    const rawKey = keyData.apiKey.trim();
    const masked = ApiKey.maskKey(rawKey);
    const addedCount = Array.from(this.slots.values()).filter(s => s.id !== 'slot_primary_env' && !s.name.includes('.env')).length;
    const defaultName = `Key ${addedCount + 1}`;
    const assignedName = keyData.name?.trim() || defaultName;

    // Check if slot already exists with this raw key or masked key
    for (const [existingId, existingSlot] of this.slots.entries()) {
      if (existingSlot.apiKey === rawKey || existingSlot.maskedKey === masked) {
        existingSlot.name = assignedName;
        existingSlot.isActive = true;
        existingSlot.rateLimit = keyData.rateLimit || existingSlot.rateLimit;
        return existingSlot;
      }
    }

    const keyId = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    let doc = null;
    try {
      doc = await ApiKey.findOneAndUpdate(
        { apiKey: rawKey },
        {
          $set: {
            apiKey: rawKey,
            maskedKey: masked,
            name: assignedName,
            provider: keyData.provider || 'gemini',
            rateLimit: keyData.rateLimit || 15,
            softLimit: keyData.softLimit || (keyData.rateLimit ? keyData.rateLimit - 3 : 12),
            isActive: true,
            healthScore: 100
          }
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      console.log(`[KeyPoolManager] Successfully persisted API Key (${assignedName} - ${masked}) to MongoDB.`);
    } catch (dbErr) {
      console.warn('[KeyPoolManager] MongoDB save skipped (offline/in-memory mode):', dbErr.message);
    }

    const slotPayload = doc ? { ...doc.toObject(), apiKey: rawKey } : {
      _id: keyId,
      id: keyId,
      apiKey: rawKey,
      maskedKey: masked,
      name: assignedName,
      provider: keyData.provider || 'gemini',
      rateLimit: keyData.rateLimit || 15,
      softLimit: keyData.softLimit || (keyData.rateLimit ? keyData.rateLimit - 3 : 12),
      isActive: true,
      healthScore: 100,
      queuePosition: this.slots.size * 25
    };

    const slot = new KeySlot(slotPayload);
    this.slots.set(slot.id, slot);

    const event = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'RELEASED',
      keyName: slot.name,
      maskedKey: slot.maskedKey,
      details: `New API Key onboarded and pre-warmed in memory pool`
    };
    this.recentEvents.unshift(event);

    return slot;
  }

  /**
   * Toggle active state of a key slot
   */
  static toggleKey(slotId, isActive) {
    const slot = this.slots.get(slotId);
    if (!slot) return false;
    slot.isActive = isActive !== undefined ? isActive : !slot.isActive;
    slot.isDirty = true;
    return slot.isActive;
  }

  /**
   * Reset health and model cooldowns for a key slot
   */
  static resetSlotHealth(slotId) {
    const slot = this.slots.get(slotId);
    if (!slot) return false;
    slot.healthScore = 100;
    slot.isOccupied = false;
    slot.occupiedBy = null;
    slot.modelStatuses.forEach(m => {
      m.status = 'HEALTHY';
      m.resetsAt = null;
      m.failureCount = 0;
    });
    slot.isDirty = true;
    return true;
  }

  /**
   * Remove a key slot from pool and DB
   */
  static async removeKey(slotId) {
    this.slots.delete(slotId);
    await ApiKey.findByIdAndDelete(slotId).catch(() => null);
    return true;
  }

  /**
   * Live snapshot for admin telemetry dashboard
   */
  static getLiveStatusSnapshot() {
    return {
      slots: Array.from(this.slots.values()).map(slot => ({
        id: slot.id,
        name: slot.name,
        maskedKey: slot.maskedKey,
        provider: slot.provider,
        isActive: slot.isActive,
        healthScore: slot.healthScore,
        queuePosition: slot.queuePosition,
        rateLimit: slot.rateLimit,
        softLimit: slot.softLimit,
        currentRPM: slot.getRequestsThisMinute(),
        isOccupied: slot.isOccupied,
        occupiedBy: slot.occupiedBy,
        occupiedSince: slot.occupiedSince,
        activeModel: slot.getBestAvailableModel(),
        modelStatuses: Object.fromEntries(slot.modelStatuses),
        totalRequests: slot.totalRequests,
        successfulRequests: slot.successfulRequests,
        failedRequests: slot.failedRequests,
        totalTokensUsed: slot.totalTokensUsed,
        avgLatencyMs: slot.avgLatencyMs,
        lastUsedAt: slot.lastUsedAt
      })),
      events: this.recentEvents.slice(0, 15)
    };
  }
}
