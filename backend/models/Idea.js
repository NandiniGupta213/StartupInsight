import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema({
  originalIdea: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  analysis: {
    overview: {
      type: String,
      required: true
    },
    industryCategory: {
      type: String,
      required: true
    },
    targetCustomers: [String],
    businessModels: [String],
    marketSize: {
      tam: String,
      sam: String,
      som: String
    },
    valueProposition: {
      type: String,
      required: true
    },
    competitors: [
      {
        name: String,
        threat: String
      }
    ],
    risks: [String],
    revenuePotential: {
      type: String,
      required: true
    },
    feasibilityScore: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    expansionMarkets: [String],
    // ADD THIS - Pricing Strategy field
    pricingStrategy: {
      priceRange: String,
      model: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a text index for searching ideas
ideaSchema.index({ originalIdea: 'text' });

export default mongoose.model('Idea', ideaSchema);