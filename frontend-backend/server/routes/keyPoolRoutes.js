import express from 'express';
import { KeyPoolManager } from '../services/KeyPoolManager.js';
import ApiKey from '../models/ApiKey.js';

const router = express.Router();

/**
 * GET /api/admin/key-pool/status
 * Live snapshot of all API key slots, RPM loads, health scores, and active models
 */
router.get('/status', async (req, res) => {
  try {
    if (!KeyPoolManager.isInitialized) {
      await KeyPoolManager.initialize();
    }

    const snapshot = KeyPoolManager.getLiveStatusSnapshot();
    const slots = snapshot.slots || [];
    const events = snapshot.events || [];
    
    // Overall pool statistics
    const totalSlots = slots.length;
    const activeSlots = slots.filter(s => s.isActive).length;
    const occupiedSlots = slots.filter(s => s.isOccupied).length;
    const healthySlots = slots.filter(s => s.healthScore > 50 && s.isActive).length;
    const currentTotalRPM = slots.reduce((sum, s) => sum + s.currentRPM, 0);
    const totalTokensTracked = slots.reduce((sum, s) => sum + s.totalTokensUsed, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalSlots,
          activeSlots,
          occupiedSlots,
          healthySlots,
          currentTotalRPM,
          totalTokensTracked
        },
        slots,
        events
      }
    });
  } catch (err) {
    console.error('[keyPoolRoutes] Error getting status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/key-pool/keys
 * Register a new API Key dynamically into the pool
 */
router.post('/keys', async (req, res) => {
  try {
    const { apiKey, name, provider, rateLimit, softLimit } = req.body;

    if (!apiKey || apiKey.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'Valid API key is required' });
    }

    const slot = await KeyPoolManager.addKey({
      apiKey,
      name,
      provider: provider || 'gemini',
      rateLimit: rateLimit ? Number(rateLimit) : 15,
      softLimit: softLimit ? Number(softLimit) : 12
    });

    res.status(201).json({
      success: true,
      message: 'API Key successfully registered in pool',
      data: {
        id: slot.id,
        name: slot.name,
        maskedKey: slot.maskedKey,
        healthScore: slot.healthScore,
        rateLimit: slot.rateLimit
      }
    });
  } catch (err) {
    console.error('[keyPoolRoutes] Error adding key:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/key-pool/keys/:id/toggle
 * Toggle active state of a key slot
 */
router.patch('/keys/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const newState = KeyPoolManager.toggleKey(id, isActive);
    await ApiKey.findByIdAndUpdate(id, { isActive: newState }).catch(() => null);

    res.json({
      success: true,
      message: `API Key ${newState ? 'enabled' : 'disabled'}`,
      data: { id, isActive: newState }
    });
  } catch (err) {
    console.error('[keyPoolRoutes] Error toggling key:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/key-pool/keys/:id/reset
 * Reset health score and model cooldowns
 */
router.post('/keys/:id/reset', async (req, res) => {
  try {
    const { id } = req.params;
    const success = KeyPoolManager.resetSlotHealth(id);

    if (success) {
      await ApiKey.findByIdAndUpdate(id, {
        healthScore: 100,
        isOccupied: false,
        occupiedBy: null
      }).catch(() => null);

      return res.json({ success: true, message: 'Key slot health and cooldowns reset' });
    }

    res.status(404).json({ success: false, error: 'Key slot not found' });
  } catch (err) {
    console.error('[keyPoolRoutes] Error resetting key:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/admin/key-pool/keys/:id
 * Delete an API key from pool
 */
router.delete('/keys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await KeyPoolManager.removeKey(id);

    res.json({ success: true, message: 'API Key deleted from pool' });
  } catch (err) {
    console.error('[keyPoolRoutes] Error deleting key:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
