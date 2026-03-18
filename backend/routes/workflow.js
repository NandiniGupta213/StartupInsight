import express from 'express';
import crypto from 'crypto';
import WorkflowAnalysis from '../models/WorkflowAnalysis.js';
import { searchSimilarStartups, addStartupToPinecone, generateEmbedding } from '../utils/pinecone.js';
import { extractIdeaInfo, enhanceAnalysisWithRetrievedData, generateFinalSummary } from '../utils/langchainWorkflow.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  const startTime = Date.now();
  const workflowId = crypto.randomUUID();
  
  try {
    const { idea } = req.body;

    if (!idea || typeof idea !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid startup idea'
      });
    }

    console.log(`🚀 Starting workflow ${workflowId} for: "${idea}"`);

    // Create workflow record
    const workflow = new WorkflowAnalysis({
      originalIdea: idea,
      workflowId,
      steps: {
        extraction: { status: 'pending' },
        embedding: { status: 'pending' },
        retrieval: { status: 'pending' },
        analysis: { status: 'pending' }
      }
    });

    await workflow.save();

    // STEP 1: Extract structured information
    console.log('📝 Step 1: Extracting structured information...');
    let extractedInfo;
    try {
      extractedInfo = await extractIdeaInfo(idea);
      workflow.steps.extraction = {
        status: 'completed',
        data: extractedInfo,
        completedAt: new Date()
      };
      await workflow.save();
      console.log('✅ Extraction completed');
    } catch (error) {
      workflow.steps.extraction = {
        status: 'failed',
        error: error.message,
        completedAt: new Date()
      };
      await workflow.save();
      throw error;
    }

    // STEP 2: Generate embedding
    console.log('🔢 Step 2: Generating embedding...');
    let embedding;
    try {
      embedding = await generateEmbedding(idea);
      workflow.steps.embedding = {
        status: 'completed',
        vectorId: `vec_${workflowId}`,
        completedAt: new Date()
      };
      await workflow.save();
      console.log('✅ Embedding generated');
    } catch (error) {
      workflow.steps.embedding = {
        status: 'failed',
        error: error.message,
        completedAt: new Date()
      };
      await workflow.save();
      throw error;
    }

    // STEP 3: Retrieve similar startups
    console.log('🔍 Step 3: Searching for similar startups...');
    let similarStartups;
    try {
      similarStartups = await searchSimilarStartups(idea, 5);
      workflow.steps.retrieval = {
        status: 'completed',
        data: similarStartups,
        completedAt: new Date()
      };
      await workflow.save();
      console.log(`✅ Found ${similarStartups.length} similar startups`);
    } catch (error) {
      workflow.steps.retrieval = {
        status: 'failed',
        error: error.message,
        completedAt: new Date()
      };
      await workflow.save();
      throw error;
    }

    // STEP 4: Enhanced analysis with retrieved data
    console.log('🧠 Step 4: Generating enhanced analysis...');
    let analysis;
    try {
      analysis = await enhanceAnalysisWithRetrievedData(idea, similarStartups);
      workflow.steps.analysis = {
        status: 'completed',
        data: analysis,
        completedAt: new Date()
      };
      await workflow.save();
      console.log('✅ Analysis completed');
    } catch (error) {
      workflow.steps.analysis = {
        status: 'failed',
        error: error.message,
        completedAt: new Date()
      };
      await workflow.save();
      throw error;
    }

    // STEP 5: Generate final summary
    console.log('📊 Step 5: Generating executive summary...');
    let summary;
    try {
      summary = await generateFinalSummary(idea, extractedInfo, similarStartups, analysis);
      console.log('✅ Summary generated');
    } catch (error) {
      console.warn('⚠️ Summary generation failed, continuing without it');
      summary = analysis.overview;
    }

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Update final analysis
    workflow.finalAnalysis = {
      ...analysis,
      summary
    };
    workflow.metadata = {
      processingTime,
      modelUsed: 'gpt-3.5-turbo',
      tokensUsed: 1500 // Approximate
    };
    await workflow.save();

    // Optionally add this startup to Pinecone for future searches
    try {
      await addStartupToPinecone({
        name: idea.substring(0, 50),
        description: analysis.overview,
        category: extractedInfo.industry,
        source: 'user-submitted'
      });
    } catch (error) {
      console.warn('⚠️ Failed to add to Pinecone:', error.message);
    }

    // Return the final response
    res.json({
      success: true,
      workflowId,
      processingTime,
      extractedInfo,
      similarStartups,
      analysis: {
        ...analysis,
        summary
      },
      metadata: {
        totalSteps: 5,
        completedSteps: 5,
        processingTimeMs: processingTime
      }
    });

  } catch (error) {
    console.error('❌ Workflow error:', error);
    
    // Update workflow with error
    try {
      await WorkflowAnalysis.findOneAndUpdate(
        { workflowId },
        { 
          $set: {
            'metadata.error': error.message,
            'metadata.completedAt': new Date()
          }
        }
      );
    } catch (updateError) {
      console.error('Failed to update workflow error:', updateError);
    }

    res.status(500).json({
      success: false,
      error: 'Workflow execution failed',
      message: error.message,
      workflowId
    });
  }
});

// GET /api/workflow/:workflowId - Get workflow status
router.get('/:workflowId', async (req, res) => {
  try {
    const workflow = await WorkflowAnalysis.findOne({ 
      workflowId: req.params.workflowId 
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      workflow: {
        id: workflow.workflowId,
        idea: workflow.originalIdea,
        steps: workflow.steps,
        finalAnalysis: workflow.finalAnalysis,
        createdAt: workflow.createdAt,
        processingTime: workflow.metadata?.processingTime
      }
    });

  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow'
    });
  }
});

// GET /api/workflow/stats/:industry - Get industry stats
router.get('/stats/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    
    const stats = await WorkflowAnalysis.aggregate([
      { $match: { 'steps.extraction.data.industry': industry } },
      { $group: {
        _id: null,
        averageFeasibility: { $avg: '$steps.analysis.data.feasibilityScore' },
        totalAnalyses: { $sum: 1 },
        commonRisks: { $push: '$steps.analysis.data.risks' }
      }}
    ]);

    res.json({
      success: true,
      industry,
      stats: stats[0] || { totalAnalyses: 0 }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch industry stats'
    });
  }
});

export default router;