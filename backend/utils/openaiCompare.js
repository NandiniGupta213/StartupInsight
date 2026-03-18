import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Using OpenAI API key
});

export const compareStartupIdeas = async (ideaA, ideaB) => {
  const prompt = `
Compare these two startup ideas in detail with a focus on the INDIAN market:

IDEA A: "${ideaA}"
IDEA B: "${ideaB}"

IMPORTANT RULES:
1. For competitors, use REAL company names that exist in this space. NEVER use placeholders.
2. Include competitors from both GLOBAL and INDIAN markets.
3. ALL market sizes, revenue figures should be in Indian Rupees (₹) with crore/lakh format.
4. Focus on Indian consumer behavior, preferences, and market dynamics.
5. Provide a clear winner with specific reasons.

Return ONLY valid JSON with this exact structure:

{
  "industry": {
    "ideaA": "Industry category for Idea A",
    "ideaB": "Industry category for Idea B",
    "insight": "Brief comparison insight about their industries"
  },
  "targetCustomers": {
    "ideaA": ["Customer segment 1", "Customer segment 2", "Customer segment 3"],
    "ideaB": ["Customer segment 1", "Customer segment 2", "Customer segment 3"],
    "insight": "Comparison of target audiences"
  },
  "businessModels": {
    "ideaA": ["Revenue model 1", "Revenue model 2", "Revenue model 3"],
    "ideaB": ["Revenue model 1", "Revenue model 2", "Revenue model 3"],
    "insight": "Comparison of business models"
  },
  "marketOpportunity": {
    "ideaA": {
      "tam": "Total Addressable Market in ₹",
      "sam": "Serviceable Addressable Market in ₹",
      "som": "Serviceable Obtainable Market in ₹"
    },
    "ideaB": {
      "tam": "Total Addressable Market in ₹",
      "sam": "Serviceable Addressable Market in ₹",
      "som": "Serviceable Obtainable Market in ₹"
    },
    "insight": "Comparison of market opportunities"
  },
  "competitors": {
    "ideaA": [
      {"name": "Competitor 1", "threat": "High/Medium/Low - reason"},
      {"name": "Competitor 2", "threat": "High/Medium/Low - reason"}
    ],
    "ideaB": [
      {"name": "Competitor 1", "threat": "High/Medium/Low - reason"},
      {"name": "Competitor 2", "threat": "High/Medium/Low - reason"}
    ],
    "insight": "Comparison of competitive landscapes"
  },
  "risks": {
    "ideaA": ["Risk 1", "Risk 2", "Risk 3", "Risk 4"],
    "ideaB": ["Risk 1", "Risk 2", "Risk 3", "Risk 4"],
    "insight": "Comparison of risk profiles"
  },
  "feasibilityScores": {
    "ideaA": 7,
    "ideaB": 8,
    "insight": "Comparison of feasibility scores"
  },
  "summary": "A comprehensive paragraph summarizing both ideas and their potential",
  "winner": "Idea A or Idea B",
  "winnerReason": "Detailed explanation why one idea is more feasible"
}`;

  try {
    console.log(`🚀 Comparing startup ideas: "${ideaA}" vs "${ideaB}" using OpenAI`);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // OpenAI model format
      messages: [
        {
          role: "system",
          content: `You are an expert startup analyst specializing in comparing business ideas for the INDIAN market.
          
          CRITICAL RULES:
          - ALWAYS use Indian Rupees (₹) for all monetary values
          - Use crore (Cr) and lakh (₹) notation (e.g., ₹10 Cr, ₹50 Lakh)
          - Use REAL company names for competitors
          - Be objective and data-driven in your comparisons
          - Clearly justify which idea is more feasible
          - Return ONLY valid JSON. No explanations, no markdown.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Validate response structure
    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from AI model');
    }

    let comparisonText = response.choices[0].message.content;
    console.log('Raw response received, length:', comparisonText.length);

    // Clean the response
    comparisonText = comparisonText
      .replace(/^```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    // Extract JSON if wrapped
    const jsonMatch = comparisonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in AI response');
    }
    comparisonText = jsonMatch[0];

    // Parse the JSON
    const comparison = JSON.parse(comparisonText);

    console.log("✅ Comparison generated successfully");
    return comparison;

  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    throw new Error(`Failed to compare startup ideas: ${error.message}`);
  }
};