import { KeyPoolManager } from './KeyPoolManager.js';
import { ActivityLogger } from './KeyPoolDaemons.js';

export class ConcurrentApiKeyManager {
  /**
   * Enterprise execution wrapper with concurrency safety, timeout race, and retry cascade
   */
  static async executeWithConcurrentSafety({
    userId = 'recruiter-session',
    operationType = 'AI_RESUME_RANKING',
    executeFunction,
    metadata = {},
    timeoutMs = 45000,
    maxRetries = 3
  }) {
    let lastError = null;
    let attempt = 0;
    const startTime = Date.now();

    while (attempt < maxRetries) {
      attempt++;
      let allocation = null;

      try {
        // 1. Acquire optimal in-memory slot
        allocation = await KeyPoolManager.acquireSlot(userId);

        if (!allocation) {
          // If all slots are busy or cooling down, brief exponential wait before retry
          const backoff = Math.min(3000, 400 * Math.pow(1.8, attempt));
          console.warn(`[ConcurrentApiKeyManager] Key pool saturated. Backing off ${backoff}ms (Attempt ${attempt}/${maxRetries})...`);
          await new Promise(r => setTimeout(r, backoff));
          continue;
        }

        const { slot, activeModel } = allocation;
        const callStartTime = Date.now();

        // 2. Execute with Promise.race Timeout protection
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`LLM_TIMEOUT: Request timed out after ${timeoutMs}ms on model ${activeModel}`));
          }, timeoutMs);
        });

        const executionPromise = executeFunction(slot.apiKey, activeModel, slot);
        const result = await Promise.race([executionPromise, timeoutPromise]);

        const latencyMs = Date.now() - callStartTime;

        // 3. Record Successful Outcome
        slot.recordOutcome(true, latencyMs, result?.usage?.totalTokens || 0);

        const slotInfo = {
          id: slot.id,
          name: slot.name,
          maskedKey: slot.maskedKey,
          activeModel,
          latencyMs,
          queuePosition: slot.queuePosition,
          timestamp: new Date().toISOString()
        };

        // Async Activity Logging (Non-Blocking)
        ActivityLogger.logEvent({
          userId,
          actionType: operationType,
          details: `Allocated ${slot.name} (${slot.maskedKey}) on ${activeModel} - Completed in ${latencyMs}ms`,
          metadata: {
            ...metadata,
            model: activeModel,
            latencyMs,
            keyName: slot.name,
            maskedKey: slot.maskedKey,
            attempt
          }
        });

        return {
          output: result,
          slotInfo
        };

      } catch (err) {
        lastError = err;
        const status = err.status || err.statusCode || (err.message && err.message.includes('429') ? 429 : 500);
        const errorMsg = err.message || '';

        console.error(`[ConcurrentApiKeyManager] Error on attempt ${attempt}:`, errorMsg);

        if (allocation && allocation.slot) {
          const { slot, activeModel } = allocation;

          // 4. Granular Error Classification & Self-Healing Action
          if (status === 401 || errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid')) {
            console.error(`[ConcurrentApiKeyManager] CRITICAL: API Key ${slot.maskedKey} is invalid. Permanently deactivating slot.`);
            slot.isActive = false;
            slot.healthScore = 0;
            slot.isDirty = true;
          } else if (status === 404 || errorMsg.includes('models/') && errorMsg.includes('is not found')) {
            console.warn(`[ConcurrentApiKeyManager] Model ${activeModel} not found for key ${slot.maskedKey}. Disabling model.`);
            slot.markModelStatus(activeModel, 'DISABLED');
          } else if (status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('Quota exceeded')) {
            console.warn(`[ConcurrentApiKeyManager] 429 Quota exhausted for model ${activeModel} on key ${slot.maskedKey}. Setting 60s cooldown.`);
            slot.markModelStatus(activeModel, 'RATE_LIMITED', 60);
            slot.adjustHealth(-30);
          } else {
            // Transient 500 / 503 / Timeout error
            slot.adjustHealth(-10);
            slot.recordOutcome(false);
          }
        }

        // Exponential backoff before next attempt
        if (attempt < maxRetries) {
          const jitter = Math.random() * 200;
          const retryDelay = 300 * Math.pow(2, attempt) + jitter;
          await new Promise(r => setTimeout(r, retryDelay));
        }

      } finally {
        // Guaranteed slot release in finally block
        if (allocation && allocation.slot) {
          KeyPoolManager.releaseSlot(allocation.slot.id);
        }
      }
    }

    // Exhausted all retries
    const totalDuration = Date.now() - startTime;
    ActivityLogger.logEvent({
      userId,
      actionType: `${operationType}_FAILED`,
      details: `Execution failed after ${maxRetries} attempts (${totalDuration}ms): ${lastError?.message}`,
      metadata: { ...metadata, error: lastError?.message }
    });

    throw new Error(`LLM Execution Failed after ${maxRetries} retry cascades: ${lastError?.message || 'Unknown LLM Error'}`);
  }
}
