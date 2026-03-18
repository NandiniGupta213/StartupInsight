import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Using OpenAI API key
});

export const generateMarketTrends = async (industry) => {
  // Clean prompt for market trends
  const prompt = `
Generate comprehensive market trends for the "${industry}" industry with a focus on both Indian and Global markets.

Return ONLY valid JSON with this exact structure:

{
  "industryCategory": "Main industry category (e.g., FinTech, HealthTech, Food & Beverage)",
  "trends": {
    "industryOverview": {
      "marketSize": "Current market size in ₹ for India and $ for global with description",
      "growthRate": "CAGR with description (e.g., 15% CAGR through 2028)",
      "keyDrivers": ["Driver 1", "Driver 2", "Driver 3", "Driver 4"],
      "challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
      "outlook": "Brief outlook for the next 3-5 years"
    },
    "consumerTrends": [
      {"trend": "Trend name", "description": "Detailed description", "impact": "High/Medium/Low"}
    ],
    "emergingOpportunities": [
      {"opportunity": "Opportunity name", "description": "Detailed description", "potential": "High/Medium/Low", "exampleStartups": ["Real Startup 1", "Real Startup 2"]}
    ],
    "investmentTrends": {
      "totalFunding": "Total funding in the space (e.g., $2.5B in 2024, ₹20,000 Cr)",
      "activeInvestors": ["Investor 1", "Investor 2", "Investor 3", "Investor 4"],
      "hotSegments": ["Segment 1", "Segment 2", "Segment 3"],
      "averageDealSize": "Average deal size (e.g., $5-10M Seed to Series A)",
      "notableDeals": [
        {"startup": "Real startup name", "amount": "Funding amount", "investors": ["Investor 1", "Investor 2"], "date": "Date (e.g., Q1 2024)"}
      ]
    },
    "regionalInsights": [
      {"region": "India", "marketSize": "Market size in ₹", "growthRate": "Growth rate", "keyPlayers": ["Player 1", "Player 2", "Player 3"]},
      {"region": "Global", "marketSize": "Market size in $", "growthRate": "Growth rate", "keyPlayers": ["Player 1", "Player 2", "Player 3"]}
    ],
    "keyMetrics": {
      "cagr": "Compound Annual Growth Rate",
      "marketLeaders": ["Leader 1", "Leader 2", "Leader 3"],
      "entryBarrier": "High/Medium/Low",
      "regulatoryEnvironment": "Description of regulatory landscape"
    }
  }
}

IMPORTANT RULES:
- Use REAL company names and data
- Include both Indian and Global context
- Use Indian Rupees (₹) for Indian market data
- Use USD ($) for global market data
- Be specific with numbers and percentages
`;

  try {
    console.log(`🚀 Generating market trends for industry: "${industry}" using OpenAI`);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // OpenAI model format
      messages: [
        {
          role: "system",
          content: `You are an expert market analyst specializing in Indian and global markets.
          
          CRITICAL RULES:
          - Use REAL company names and data
          - Include specific numbers and percentages
          - Use Indian Rupees (₹) for Indian market data
          - Use USD ($) for global market data
          - Return ONLY valid JSON. No explanations, no markdown.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    // Validate response structure
    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from AI model');
    }

    let trendsText = response.choices[0].message.content;
    console.log('Raw response received, length:', trendsText.length);

    // Clean the response
    trendsText = trendsText
      .replace(/^```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    // Extract JSON if wrapped
    const jsonMatch = trendsText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in AI response');
    }
    trendsText = jsonMatch[0];

    // Fix common JSON issues
    trendsText = trendsText
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // Add quotes to property names if missing

    // Parse the JSON
    const trends = JSON.parse(trendsText);
    
    console.log(`✅ Market trends generated successfully for ${industry}`);
    return trends;

  } catch (error) {
    console.error('❌ OpenAI API Error:', error);
    throw new Error(`Failed to generate market trends: ${error.message}`);
  }
};