import ApiKey from '../models/ApiKey.js';
import ActivityLog from '../models/ActivityLog.js';
import { KeyPoolManager } from './KeyPoolManager.js';

/**
 * Non-blocking In-Memory Activity Logger Queue
 */
export class ActivityLogger {
  static queue = [];
  static isProcessing = false;

  static logEvent(event) {
    this.queue.push({
      ...event,
      timestamp: new Date()
    });
    if (!this.isProcessing) {
      this.flushQueue();
    }
  }

  static async flushQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const batch = this.queue.splice(0, 50);

    try {
      const docs = batch.map(item => ({
        user_id: item.userId || 'system',
        user_name: item.userName || 'System Engine',
        action_type: item.actionType || 'AI_OPERATION',
        details: item.details || '',
        metadata: item.metadata || {},
        timestamp: item.timestamp || new Date()
      }));

      await ActivityLog.insertMany(docs, { ordered: false }).catch(() => null);
    } catch (err) {
      console.warn('[ActivityLogger] Error persisting activity logs:', err.message);
    } finally {
      if (this.queue.length > 0) {
        setTimeout(() => this.flushQueue(), 1000);
      } else {
        this.isProcessing = false;
      }
    }
  }
}

/**
 * Master Background Daemons Manager
 */
export class KeyPoolDaemons {
  static syncInterval = null;
  static zombieInterval = null;
  static healerInterval = null;

  static startDaemons() {
    console.log('[KeyPoolDaemons] Starting background automation & self-healing daemons...');

    // 1. DB Batch Sync Daemon: Flush dirty slots every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncDirtySlotsToDb();
    }, 30000);

    // 2. Zombie Lock Sweeper: Check every 30 seconds for stalled locks (> 5 mins)
    this.zombieInterval = setInterval(() => {
      this.sweepZombieLocks();
    }, 30000);

    // 3. Cooldown Auto-Healer: Check every 60 seconds to heal recovered models
    this.healerInterval = setInterval(() => {
      this.healModelCooldowns();
    }, 60000);
  }

  /**
   * Batch sync in-memory metrics to MongoDB in a single bulkWrite
   */
  static async syncDirtySlotsToDb() {
    const dirtySlots = Array.from(KeyPoolManager.slots.values()).filter(s => s.isDirty);
    if (dirtySlots.length === 0) return;

    const operations = dirtySlots.map(slot => ({
      updateOne: {
        filter: { _id: slot.id },
        update: {
          $set: {
            isActive: slot.isActive,
            healthScore: slot.healthScore,
            queuePosition: slot.queuePosition,
            totalRequests: slot.totalRequests,
            successfulRequests: slot.successfulRequests,
            failedRequests: slot.failedRequests,
            totalTokensUsed: slot.totalTokensUsed,
            avgLatencyMs: slot.avgLatencyMs,
            lastUsedAt: slot.lastUsedAt,
            modelStatuses: Object.fromEntries(slot.modelStatuses)
          }
        }
      }
    }));

    try {
      await ApiKey.bulkWrite(operations, { ordered: false }).catch(() => null);
      dirtySlots.forEach(s => s.isDirty = false);
    } catch (err) {
      console.warn('[KeyPoolDaemons] Bulk sync encountered non-critical issue:', err.message);
    }
  }

  /**
   * Sweep and release zombie locks occupied for > 5 minutes
   */
  static sweepZombieLocks() {
    const now = Date.now();
    const fiveMinutesAgo = now - 300000;

    KeyPoolManager.slots.forEach(slot => {
      if (slot.isOccupied && slot.occupiedSince && new Date(slot.occupiedSince).getTime() < fiveMinutesAgo) {
        console.warn(`[KeyPoolDaemons] Force-releasing ZOMBIE lock on key slot ${slot.maskedKey} (occupied since ${slot.occupiedSince})`);
        slot.isOccupied = false;
        slot.occupiedBy = null;
        slot.occupiedSince = null;
        slot.adjustHealth(-15);
        slot.isDirty = true;
      }
    });
  }

  /**
   * Auto-heal expired model cooldowns
   */
  static healModelCooldowns() {
    const now = new Date();

    KeyPoolManager.slots.forEach(slot => {
      let healedAny = false;

      slot.modelStatuses.forEach((info, model) => {
        if (info.status === 'RATE_LIMITED' && info.resetsAt && new Date(info.resetsAt) <= now) {
          console.log(`[KeyPoolDaemons] Auto-healing model cooldown for ${model} on key ${slot.maskedKey}`);
          info.status = 'HEALTHY';
          info.resetsAt = null;
          info.failureCount = 0;
          healedAny = true;
        }
      });

      if (healedAny) {
        slot.adjustHealth(+15);
        slot.isDirty = true;
      }
    });
  }

  static stopDaemons() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    if (this.zombieInterval) clearInterval(this.zombieInterval);
    if (this.healerInterval) clearInterval(this.healerInterval);
  }
}
