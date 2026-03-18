import express from 'express';
import MarketTrend from '../models/MarketTrend.js';
import { generateMarketTrends } from '../utils/marketTrendsAI.js';

const router = express.Router();

// POST /api/market/trends - Get market trends for an industry
router.post('/trends', async (req, res) => {
  try {
    const { industry } = req.body;

    // Validate input
    if (!industry || typeof industry !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid industry or startup idea'
      });
    }

    const cleanedIndustry = industry.trim();
    const normalizedIndustry = cleanedIndustry.toLowerCase();

    console.log(`🔍 Fetching market trends for: ${cleanedIndustry}`);

    // Check if trends exist in cache
    const existingTrends = await MarketTrend.findOne({ 
      industry: { $regex: new RegExp(`^${normalizedIndustry}$`, 'i') }
    });

    if (existingTrends) {
      console.log('📦 Returning cached market trends');
      return res.json({
        success: true,
        cached: true,
        industry: existingTrends.industry,
        industryCategory: existingTrends.industryCategory,
        trends: existingTrends.trends,
        lastUpdated: existingTrends.lastUpdated
      });
    }

    // Generate new trends using AI
    console.log('🤖 Generating new market trends with AI...');
    const trendData = await generateMarketTrends(cleanedIndustry);

    // Save to MongoDB
    const newTrend = new MarketTrend({
      industry: normalizedIndustry,
      industryCategory: trendData.industryCategory,
      trends: trendData.trends
    });

    await newTrend.save();

    // Return the trends
    res.json({
      success: true,
      cached: false,
      industry: cleanedIndustry,
      industryCategory: trendData.industryCategory,
      trends: trendData.trends,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Market trends error:', error);
    
    res.status(500).json({
      success: false,
      error: 'An error occurred while fetching market trends'
    });
  }
});

// GET /api/market/trends/:industry - Get trends for a specific industry
router.get('/trends/:industry', async (req, res) => {
  try {
    const { industry } = req.params;

    const trends = await MarketTrend.findOne({ 
      industry: { $regex: new RegExp(`^${industry}$`, 'i') }
    });

    if (!trends) {
      return res.status(404).json({
        success: false,
        error: 'Market trends not found for this industry'
      });
    }

    res.json({
      success: true,
      cached: true,
      industry: trends.industry,
      industryCategory: trends.industryCategory,
      trends: trends.trends,
      lastUpdated: trends.lastUpdated
    });

  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market trends'
    });
  }
});

// GET /api/market/industries - Get list of all analyzed industries
router.get('/industries', async (req, res) => {
  try {
    const industries = await MarketTrend.find()
      .select('industry industryCategory lastUpdated')
      .sort({ lastUpdated: -1 });

    res.json({
      success: true,
      count: industries.length,
      industries
    });

  } catch (error) {
    console.error('Error fetching industries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch industries'
    });
  }
});

// POST /api/market/refresh/:industry - Force refresh trends for an industry
router.post('/refresh/:industry', async (req, res) => {
  try {
    const { industry } = req.params;

    console.log(`🔄 Refreshing market trends for: ${industry}`);

    // Generate new trends
    const trendData = await generateMarketTrends(industry);

    // Update or create
    const updated = await MarketTrend.findOneAndUpdate(
      { industry: { $regex: new RegExp(`^${industry}$`, 'i') } },
      {
        industry: industry.toLowerCase(),
        industryCategory: trendData.industryCategory,
        trends: trendData.trends,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Market trends refreshed successfully',
      industry: updated.industry,
      industryCategory: updated.industryCategory,
      trends: updated.trends,
      lastUpdated: updated.lastUpdated
    });

  } catch (error) {
    console.error('Error refreshing trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh market trends'
    });
  }
});

export default router;