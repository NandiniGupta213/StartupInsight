import mongoose from 'mongoose';

const workflowAnalysisSchema = new mongoose.Schema({
  originalIdea: {
    type: String,
    required: true,
    trim: true
  },
  workflowId: {
    type: String,
    required: true,
    unique: true
  },
  steps: {
    extraction: {
      status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
      data: {
        industry: String,
        subCategory: String,
        keywords: [String],
        businessModel: String,
        targetMarket: String,
        customerSegments: [String]
      },
      error: String,
      completedAt: Date
    },
    embedding: {
      status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
      vectorId: String,
      error: String,
      completedAt: Date
    },
    retrieval: {
      status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
      data: [{
        name: String,
        similarity: Number,
        description: String,
        category: String,
        founded: String,
        funding: String,
        metadata: mongoose.Schema.Types.Mixed
      }],
      error: String,
      completedAt: Date
    },
    analysis: {
      status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
      data: {
        overview: String,
        marketOpportunity: {
          marketSize: String,
          growthRate: String,
          keyTrends: [String],
        },
        competitors: [{
          name: String,
          threat: String,
          differentiator: String
        }],
        risks: [String],
        feasibilityScore: Number,
        recommendations: [String],
        swot: {
          strengths: [String],
          weaknesses: [String],
          opportunities: [String],
          threats: [String]
        }
      },
      error: String,
      completedAt: Date
    }
  },
  finalAnalysis: mongoose.Schema.Types.Mixed,
  metadata: {
    processingTime: Number,
    modelUsed: String,
    tokensUsed: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
workflowAnalysisSchema.index({ workflowId: 1 });
workflowAnalysisSchema.index({ 'steps.extraction.data.industry': 1 });

export default mongoose.model('WorkflowAnalysis', workflowAnalysisSchema);