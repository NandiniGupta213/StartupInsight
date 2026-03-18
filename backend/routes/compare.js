import express from 'express';
import Comparison from '../models/Comparison.js';
import { compareStartupIdeas } from '../utils/openaiCompare.js';
import crypto from 'crypto';

const router = express.Router();

// Helper to generate unique ID for idea pair
const generateIdeaPairId = (ideaA, ideaB) => {
  const sorted = [ideaA.trim().toLowerCase(), ideaB.trim().toLowerCase()].sort();
  return crypto.createHash('md5').update(sorted.join('||')).digest('hex');
};

// POST /api/open/compare - Compare two startup ideas
router.post('/compare', async (req, res) => {
  try {
    const { ideaA, ideaB } = req.body;

    // Validate input
    if (!ideaA || typeof ideaA !== 'string' || !ideaB || typeof ideaB !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide valid startup ideas as strings'
      });
    }

    const trimmedIdeaA = ideaA.trim();
    const trimmedIdeaB = ideaB.trim();
    const pairId = generateIdeaPairId(trimmedIdeaA, trimmedIdeaB);

    // Check if this pair was already compared
    const existingComparison = await Comparison.findOne({ ideaPair: pairId });
    
    if (existingComparison) {
      console.log('Returning cached comparison for ideas:', trimmedIdeaA, 'vs', trimmedIdeaB);
      return res.json({
        success: true,
        cached: true,
        comparison: existingComparison.comparison,
        ideaA: existingComparison.ideaA,
        ideaB: existingComparison.ideaB
      });
    }

    // Compare ideas using OpenAI
    console.log('Comparing new ideas:', trimmedIdeaA, 'vs', trimmedIdeaB);
    const comparison = await compareStartupIdeas(trimmedIdeaA, trimmedIdeaB);

    // Save to MongoDB
    const newComparison = new Comparison({
      ideaPair: pairId,
      ideaA: {
        text: trimmedIdeaA,
        analysis: comparison
      },
      ideaB: {
        text: trimmedIdeaB,
        analysis: comparison
      },
      comparison: comparison
    });

    await newComparison.save();

    // Return the comparison
    res.json({
      success: true,
      cached: false,
      comparison: comparison,
      ideaA: { text: trimmedIdeaA },
      ideaB: { text: trimmedIdeaB }
    });

  } catch (error) {
    console.error('Comparison error:', error);
    
    res.status(500).json({
      success: false,
      error: 'An error occurred while comparing startup ideas'
    });
  }
});

// GET /api/open/comparisons - Get all past comparisons
router.get('/comparisons', async (req, res) => {
  try {
    const comparisons = await Comparison.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: comparisons.length,
      comparisons: comparisons.map(c => ({
        id: c._id,
        ideaA: c.ideaA.text,
        ideaB: c.ideaB.text,
        winner: c.comparison.winner,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comparisons'
    });
  }
});

// GET /api/open/comparisons/:id - Get specific comparison by ID
router.get('/comparisons/:id', async (req, res) => {
  try {
    const comparison = await Comparison.findById(req.params.id);
    
    if (!comparison) {
      return res.status(404).json({
        success: false,
        error: 'Comparison not found'
      });
    }

    res.json({
      success: true,
      comparison: comparison.comparison,
      ideaA: comparison.ideaA,
      ideaB: comparison.ideaB
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comparison'
    });
  }
});

export default router;