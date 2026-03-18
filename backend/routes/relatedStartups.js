import express from 'express';
import Startup from '../models/Startup.js';
import { analyzeSearchQuery } from '../utils/queryAnalyzer.js';
import { generateRelatedStartups } from '../utils/startupGenerator.js';

const router = express.Router();

// POST /api/startup/related - Get related startups based on search query
router.post('/related', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid search query'
      });
    }

    console.log(`🔍 Searching for startups related to: "${query}"`);

    // Step 1: Analyze the query using AI
    const analysis = await analyzeSearchQuery(query);
    
    // Step 2: Search database using extracted keywords
    const searchKeywords = [...analysis.keywords, ...analysis.relatedTerms, query.toLowerCase()];
    
    const dbStartups = await Startup.find({
      $or: [
        { name: { $regex: new RegExp(searchKeywords.join('|'), 'i') } },
        { industryCategory: { $regex: new RegExp(analysis.mainIndustry, 'i') } },
        { subCategory: { $regex: new RegExp(analysis.subCategory, 'i') } },
        { keywords: { $in: searchKeywords } },
        { industryTags: { $in: searchKeywords } },
        { originalIdea: { $regex: new RegExp(searchKeywords.join('|'), 'i') } }
      ]
    }).limit(20);

    console.log(`📦 Found ${dbStartups.length} startups in database`);

    // Step 3: Format database results
    const formattedDbStartups = dbStartups.map(startup => ({
      id: startup._id,
      name: startup.name || startup.originalIdea,
      category: startup.analysis?.industryCategory || analysis.mainIndustry,
      subCategory: startup.subCategory || analysis.subCategory,
      description: startup.analysis?.overview?.substring(0, 100) + '...' || '',
      source: 'database',
      region: startup.region || 'India',
      keywords: startup.keywords || [],
      analysis: startup.analysis
    }));

    // Step 4: If we have fewer than 8 results, generate additional startups
    let generatedStartups = [];
    if (formattedDbStartups.length < 8) {
      const needed = 8 - formattedDbStartups.length;
      console.log(`🤖 Generating ${needed} additional startups...`);
      
      generatedStartups = await generateRelatedStartups(
        analysis.mainIndustry,
        analysis.keywords,
        needed
      );
    }

    // Step 5: Combine and deduplicate results
    const allStartups = [...formattedDbStartups];
    
    // Add generated startups (avoid duplicates with existing)
    for (const gen of generatedStartups) {
      const exists = allStartups.some(s => 
        s.name.toLowerCase() === gen.name.toLowerCase()
      );
      if (!exists) {
        allStartups.push({
          id: `gen-${Date.now()}-${Math.random()}`,
          name: gen.name,
          category: gen.industryCategory,
          subCategory: gen.subCategory,
          description: gen.description,
          source: 'ai-generated',
          region: gen.region,
          keywords: gen.keywords,
          isAIGenerated: true
        });
      }
    }

    // Step 6: Sort results (prioritize Indian companies, then database, then generated)
    const sortedStartups = allStartups.sort((a, b) => {
      // Prioritize Indian companies
      if (a.region === 'India' && b.region !== 'India') return -1;
      if (a.region !== 'India' && b.region === 'India') return 1;
      
      // Then prioritize database results
      if (a.source === 'database' && b.source !== 'database') return -1;
      if (a.source !== 'database' && b.source === 'database') return 1;
      
      return 0;
    });

    // Step 7: Return the response
    res.json({
      success: true,
      query: query,
      analysis: {
        mainIndustry: analysis.mainIndustry,
        subCategory: analysis.subCategory,
        keywords: analysis.keywords,
        suggestedCompanies: analysis.suggestedCompanies
      },
      startups: sortedStartups.slice(0, 15), // Limit to 15 results
      totalFound: sortedStartups.length,
      stats: {
        databaseResults: formattedDbStartups.length,
        generatedResults: generatedStartups.length,
        indianCompanies: sortedStartups.filter(s => s.region === 'India').length,
        globalCompanies: sortedStartups.filter(s => s.region === 'Global').length
      }
    });

  } catch (error) {
    console.error('Related startups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch related startups'
    });
  }
});

// GET /api/startup/related/:query - Simple GET version
router.get('/related/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    // Reuse the same logic
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/startup/related`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Related startups GET error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch related startups'
    });
  }
});

export default router;