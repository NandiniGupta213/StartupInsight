import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

const analyzeStartupIdea = async (idea) => {
  const prompt = `
Analyze the following startup idea in detail with a focus on the INDIAN market: "${idea}"

IMPORTANT RULES:
1. For competitors, use REAL company names that exist in this space. NEVER use placeholders like "Company X" or "Company Y".
2. Include competitors from both GLOBAL and INDIAN markets (at least 2-3 Indian competitors).
3. ALL market sizes, revenue figures, and pricing should be in Indian Rupees (₹) with crore/lakh format where appropriate.
4. Focus on Indian consumer behavior, preferences, and market dynamics.

Return ONLY valid JSON with this exact structure:

{
  "overview": "A compelling 2-3 sentence overview of the startup idea with Indian market context",
  "industryCategory": "Main industry category (e.g., FinTech, HealthTech, E-commerce, Food & Beverage)",
  "targetCustomers": ["Specific Indian customer segment 1", "Specific Indian customer segment 2", "Specific Indian customer segment 3"],
  "businessModels": ["Specific revenue model 1 for Indian market", "Specific revenue model 2", "Specific revenue model 3"],
  "marketSize": {
    "tam": "Total Addressable Market in ₹ with description for GLOBAL market (e.g., ₹10,000 Cr global market)",
    "sam": "Serviceable Addressable Market in ₹ with description for INDIAN market (e.g., ₹2,500 Cr Indian market)",
    "som": "Serviceable Obtainable Market in ₹ with description for first 3 years in India (e.g., ₹100 Cr achievable)"
  },
  "valueProposition": "Clear statement of unique value offered to Indian customers",
  "competitors": [
    {"name": "INDIAN COMPETITOR 1", "threat": "High/Medium/Low - specific reason with market share if known"},
    {"name": "INDIAN COMPETITOR 2", "threat": "High/Medium/Low - specific reason with market share if known"},
    {"name": "INDIAN COMPETITOR 3", "threat": "High/Medium/Low - specific reason with market share if known"},
    {"name": "GLOBAL COMPETITOR 1", "threat": "High/Medium/Low - specific reason with presence in India"},
    {"name": "GLOBAL COMPETITOR 2", "threat": "High/Medium/Low - specific reason with presence in India"}
  ],
  "risks": ["Specific risk 1 for Indian market", "Specific risk 2", "Specific risk 3", "Specific risk 4"],
  "revenuePotential": "Detailed description of revenue potential with estimated figures in ₹ Crores",
  "feasibilityScore": 8,
  "expansionMarkets": ["Tier 1 Indian Cities", "Tier 2 Indian Cities", "South East Asia", "Middle East", "Global"],
  "pricingStrategy": {
    "priceRange": "Price range in ₹ for products/services",
    "model": "Pricing model description (e.g., Freemium, Subscription, One-time payment)"
  }
}

Ensure feasibilityScore is between 1-10.
Use REAL company names only. Indian competitors should be listed FIRST.
ALL monetary values should be in Indian Rupees (₹) with crore/lakh notation.
`;

  try {
    console.log(`🚀 Analyzing startup idea: "${idea}" using paid model`);
    
    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert startup analyst specializing in the INDIAN market. 
          
          CRITICAL RULES:
          - ALWAYS use Indian Rupees (₹) for all monetary values
          - Use crore (Cr) and lakh (₹) notation (e.g., ₹10 Cr, ₹50 Lakh)
          - List Indian competitors FIRST in the competitors array
          
          For Indian competitors, use REAL companies like:
          - FinTech: Paytm, PhonePe, Razorpay, CRED, Zerodha, Groww, BharatPe
          - Food & Beverage: Raw Pressery, Paper Boat, Epigamia, Slurp Farm, B Natural, Real Fruit Juice
          - E-commerce: Flipkart, Amazon India, Myntra, Nykaa, Meesho
          - HealthTech: Practo, 1mg, PharmEasy, Cult.fit
          - EdTech: Byju's, Unacademy, UpGrad, Vedantu
          - Mobility: Ola, Uber India, Rapido
          - Delivery: Zomato, Swiggy, Dunzo
          
          Be specific with Indian market dynamics, consumer behavior, and pricing.
          Return ONLY valid JSON. No explanations, no markdown.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1800
    });

    // Validate response structure
    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from AI model');
    }

    let analysisText = response.choices[0].message.content;
    console.log('Raw response received, length:', analysisText.length);

    // Clean the response
    analysisText = analysisText
      .replace(/^```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    // Extract JSON if wrapped
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in AI response');
    }
    analysisText = jsonMatch[0];

    // Parse the JSON
    const analysis = JSON.parse(analysisText);

    // Ensure Indian competitors are listed first
    const competitors = analysis.competitors || [];
    
    const indianCompetitors = competitors.filter(c => 
      !c.name.includes('Amazon') && 
      !c.name.includes('Google') && 
      !c.name.includes('Facebook') && 
      !c.name.includes('Microsoft') &&
      !c.name.includes('Uber') &&
      !c.name.includes('Global')
    );
    
    const globalCompetitors = competitors.filter(c => 
      c.name.includes('Amazon') || 
      c.name.includes('Google') || 
      c.name.includes('Facebook') || 
      c.name.includes('Microsoft') ||
      c.name.includes('Uber') ||
      !indianCompetitors.includes(c)
    );

    const sortedCompetitors = [...indianCompetitors, ...globalCompetitors];

    // Return the analysis as-is (no fallbacks)
    const validatedAnalysis = {
      overview: analysis.overview,
      industryCategory: analysis.industryCategory,
      targetCustomers: analysis.targetCustomers,
      businessModels: analysis.businessModels,
      marketSize: {
        tam: analysis.marketSize?.tam,
        sam: analysis.marketSize?.sam,
        som: analysis.marketSize?.som
      },
      valueProposition: analysis.valueProposition,
      competitors: sortedCompetitors.length > 0 ? sortedCompetitors : analysis.competitors,
      risks: analysis.risks,
      revenuePotential: analysis.revenuePotential,
      feasibilityScore: analysis.feasibilityScore,
      expansionMarkets: analysis.expansionMarkets,
      pricingStrategy: analysis.pricingStrategy
    };

    console.log("✅ Analysis completed successfully");
    console.log("Pricing Strategy:", validatedAnalysis.pricingStrategy);

    return validatedAnalysis;

  } catch (error) {
    console.error("❌ OpenRouter API Error:", error);
    throw new Error(`Failed to analyze startup idea: ${error.message}`);
  }
};

export { analyzeStartupIdea };