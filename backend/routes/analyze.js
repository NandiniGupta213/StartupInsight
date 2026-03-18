import express from 'express';
import Idea from '../models/Idea.js';
import { analyzeStartupIdea } from '../utils/openai.js';

const router = express.Router();

// POST /api/startup/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { idea } = req.body;

    // Validate input
    if (!idea || typeof idea !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid startup idea as a string'
      });
    }

    const trimmedIdea = idea.trim();
    const normalizedIdea = trimmedIdea.toLowerCase();

    // Check if idea was already analyzed
    const existingIdea = await Idea.findOne({ originalIdea: normalizedIdea });
    
    if (existingIdea) {
      console.log('Found cached analysis for idea:', trimmedIdea);
      
      // Check if cached data has pricingStrategy
      if (!existingIdea.analysis.pricingStrategy) {
        console.log('⚠️ Old cache missing pricingStrategy - updating...');
        
        // Get fresh analysis
        const freshAnalysis = await analyzeStartupIdea(trimmedIdea);
        
        // Update existing idea
        existingIdea.analysis = freshAnalysis;
        existingIdea.markModified('analysis'); // CRITICAL
        await existingIdea.save();
        
        console.log('✅ Cache updated with pricingStrategy');
        
        return res.json({
          success: true,
          cached: false,
          analysis: freshAnalysis
        });
      }
      
      return res.json({
        success: true,
        cached: true,
        analysis: existingIdea.analysis
      });
    }

    // Analyze the idea using OpenAI
    console.log('Analyzing new idea:', trimmedIdea);
    const analysis = await analyzeStartupIdea(trimmedIdea);

    // Save to MongoDB
    const newIdea = new Idea({
      originalIdea: normalizedIdea,
      analysis
    });

    // CRITICAL: Mark nested object as modified
    newIdea.markModified('analysis');
    
    await newIdea.save();

    console.log('✅ Saved new analysis with pricingStrategy:', !!analysis.pricingStrategy);

    // Return the analysis
    res.json({
      success: true,
      cached: false,
      analysis
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    res.status(500).json({
      success: false,
      error: 'An error occurred while analyzing your startup idea'
    });
  }
});

// GET /api/startup/ideas - Get all analyzed ideas
router.get('/ideas', async (req, res) => {
  try {
    const ideas = await Idea.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: ideas.length,
      ideas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ideas'
    });
  }
});

// GET /api/startup/ideas/:id - Get specific idea by ID
router.get('/ideas/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Idea not found'
      });
    }

    res.json({
      success: true,
      idea
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch idea'
    });
  }
});

// Optional: Debug route to check raw MongoDB data
router.get('/debug/:idea', async (req, res) => {
  try {
    const idea = req.params.idea.toLowerCase().trim();
    
    // Get raw MongoDB document (bypassing Mongoose)
    const db = mongoose.connection.db;
    const collection = db.collection('ideas');
    const rawDoc = await collection.findOne({ originalIdea: idea });
    
    // Get Mongoose document
    const mongooseDoc = await Idea.findOne({ originalIdea: idea });
    
    res.json({
      raw_doc_has_pricing: rawDoc ? !!rawDoc.analysis?.pricingStrategy : false,
      raw_pricing: rawDoc?.analysis?.pricingStrategy || null,
      mongoose_doc_has_pricing: mongooseDoc ? !!mongooseDoc.analysis?.pricingStrategy : false,
      mongoose_pricing: mongooseDoc?.analysis?.pricingStrategy || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;