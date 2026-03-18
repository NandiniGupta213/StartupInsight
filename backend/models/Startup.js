import mongoose from 'mongoose';

const startupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalIdea: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  analysis: {
    overview: String,
    industryCategory: String,
    targetCustomers: [String],
    businessModels: [String],
    marketSize: {
      tam: String,
      sam: String,
      som: String
    },
    valueProposition: String,
    competitors: [{ name: String, threat: String }],
    risks: [String],
    revenuePotential: String,
    feasibilityScore: Number,
    expansionMarkets: [String],
    pricingStrategy: {
      priceRange: String,
      model: String
    }
  },
  // Enhanced fields for better search
  keywords: [String],
  industryTags: [String],
  subCategory: String,
  region: {
    type: String,
    default: 'India'
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['database', 'ai-generated'],
    default: 'database'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient searching
startupSchema.index({ name: 'text', keywords: 'text', industryTags: 'text' });
startupSchema.index({ industryCategory: 1 });
startupSchema.index({ subCategory: 1 });
startupSchema.index({ region: 1 });

export default mongoose.model('Startup', startupSchema);