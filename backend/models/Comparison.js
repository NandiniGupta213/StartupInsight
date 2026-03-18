import mongoose from 'mongoose';

const comparisonSchema = new mongoose.Schema({
  ideaPair: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  ideaA: {
    text: String,
    analysis: mongoose.Schema.Types.Mixed
  },
  ideaB: {
    text: String,
    analysis: mongoose.Schema.Types.Mixed
  },
  comparison: {
    industry: {
      ideaA: String,
      ideaB: String,
      insight: String
    },
    targetCustomers: {
      ideaA: [String],
      ideaB: [String],
      insight: String
    },
    businessModels: {
      ideaA: [String],
      ideaB: [String],
      insight: String
    },
    marketOpportunity: {
      ideaA: {
        tam: String,
        sam: String,
        som: String
      },
      ideaB: {
        tam: String,
        sam: String,
        som: String
      },
      insight: String
    },
    competitors: {
      ideaA: [{ name: String, threat: String }],
      ideaB: [{ name: String, threat: String }],
      insight: String
    },
    risks: {
      ideaA: [String],
      ideaB: [String],
      insight: String
    },
    feasibilityScores: {
      ideaA: Number,
      ideaB: Number,
      insight: String
    },
    summary: String,
    winner: String,
    winnerReason: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for searching idea pairs
comparisonSchema.index({ ideaA: 'text', ideaB: 'text' });

export default mongoose.model('Comparison', comparisonSchema);