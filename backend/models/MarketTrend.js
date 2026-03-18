import mongoose from 'mongoose';

const marketTrendSchema = new mongoose.Schema({
  industry: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  industryCategory: {
    type: String,
    required: true
  },
  trends: {
    industryOverview: {
      marketSize: String,
      growthRate: String,
      keyDrivers: [String],
      challenges: [String],
      outlook: String
    },
    consumerTrends: [
      {
        trend: String,
        description: String,
        impact: String // High/Medium/Low
      }
    ],
    emergingOpportunities: [
      {
        opportunity: String,
        description: String,
        potential: String, // High/Medium/Low
        exampleStartups: [String]
      }
    ],
    investmentTrends: {
      totalFunding: String,
      activeInvestors: [String],
      hotSegments: [String],
      averageDealSize: String,
      notableDeals: [
        {
          startup: String,
          amount: String,
          investors: [String],
          date: String
        }
      ]
    },
    regionalInsights: [
      {
        region: String, // India, USA, Europe, Southeast Asia, etc.
        marketSize: String,
        growthRate: String,
        keyPlayers: [String]
      }
    ],
    keyMetrics: {
      cagr: String,
      marketLeaders: [String],
      entryBarrier: String, // High/Medium/Low
      regulatoryEnvironment: String
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a text index for searching industries
marketTrendSchema.index({ industry: 'text', industryCategory: 'text' });

export default mongoose.model('MarketTrend', marketTrendSchema);