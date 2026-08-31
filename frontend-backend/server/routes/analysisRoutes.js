import express from 'express';
import mongoose from 'mongoose';
import AnalysisResult from '../models/AnalysisResult.js';

import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

const router = express.Router();
let memoryAnalysis = [];

// POST /api/analysis/parse-file - Server-side universal document text parser
router.post('/parse-file', express.raw({ type: '*/*', limit: '25mb' }), async (req, res) => {
  try {
    const filename = req.headers['x-file-name'] || 'document.pdf';
    const buffer = req.body;

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ success: false, error: 'Empty file buffer received' });
    }

    let extractedText = '';
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith('.pdf')) {
      try {
        const parsed = await pdfParse(buffer);
        extractedText = parsed.text || '';
      } catch (pdfErr) {
        console.warn(`[Parse API] pdf-parse fallback for ${filename}:`, pdfErr.message);
        const rawStr = buffer.toString('binary');
        const matches = rawStr.match(/\(([^)]+)\)/g);
        if (matches) {
          extractedText = matches.map(m => m.slice(1, -1)).join(' ').replace(/\\[rn]/g, ' ').replace(/\s+/g, ' ');
        }
      }
    } else if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } catch (docErr) {
        console.warn(`[Parse API] Mammoth fallback for ${filename}:`, docErr.message);
        extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      }
    } else {
      extractedText = buffer.toString('utf-8');
    }

    const cleanText = extractedText
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText || cleanText.length < 15) {
      return res.status(422).json({ success: false, error: 'Could not extract text from document' });
    }

    console.log(`[Parse API] Successfully parsed ${filename} (${cleanText.length} chars)`);

    res.json({
      success: true,
      data: {
        text: cleanText,
        characterCount: cleanText.length,
        filename
      }
    });
  } catch (err) {
    console.error('[Parse API] File extraction failure:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/analysis - Save full analysis session
router.post('/', async (req, res) => {
  try {
    const {
      job_description_id,
      candidates,
      total_candidates,
      relevant_candidates,
      average_score,
      top_candidates,
      processing_time,
    } = req.body;

    const payload = {
      job_description_id,
      candidates: Array.isArray(candidates) ? candidates : [],
      total_candidates: total_candidates || candidates?.length || 0,
      relevant_candidates: relevant_candidates || candidates?.filter((c) => c.is_relevant)?.length || 0,
      average_score: average_score || (candidates?.length ? Math.round(candidates.reduce((sum, c) => sum + (c.match_score || 0), 0) / candidates.length) : 0),
      top_candidates: top_candidates || candidates?.filter((c) => c.match_score >= 80)?.length || 0,
      processing_time: processing_time || 0,
      analysis_date: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const analysis = new AnalysisResult(payload);
      const saved = await analysis.save();
      return res.status(201).json({ success: true, data: saved });
    } else {
      const record = {
        id: `analysis_${Date.now()}`,
        _id: `analysis_${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      memoryAnalysis.unshift(record);
      return res.status(201).json({ success: true, data: record });
    }
  } catch (error) {
    console.error('[Analysis API] Save Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

import { ConcurrentApiKeyManager } from '../services/ConcurrentApiKeyManager.js';

// POST /api/analysis/ai-screen - Zero-latency LLM execution through the Multi-Key Pool
router.post('/ai-screen', async (req, res) => {
  try {
    const { prompt, userId = 'recruiter-session', operationType = 'AI_RESUME_EVALUATION' } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const result = await ConcurrentApiKeyManager.executeWithConcurrentSafety({
      userId,
      operationType,
      timeoutMs: 45000,
      maxRetries: 3,
      executeFunction: async (apiKey, activeModel) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const err = new Error(`Gemini API error (${response.status}): ${errorData.error?.message || response.statusText}`);
          err.status = response.status;
          throw err;
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        if (!candidate || !candidate.content?.parts?.[0]?.text) {
          throw new Error('Invalid response structure returned by Gemini model');
        }

        return candidate.content.parts[0].text;
      }
    });

    res.json({
      success: true,
      data: {
        rawOutput: result.output || result,
        slotInfo: result.slotInfo || null
      }
    });
  } catch (error) {
    console.error('[Analysis API] AI-Screen Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

