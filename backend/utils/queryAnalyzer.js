import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Using OpenAI API key
});

export const analyzeSearchQuery = async (query) => {
  const prompt = `
Analyze this startup search query: "${query}"

Extract key information and return ONLY valid JSON with this exact structure:

{
  "mainIndustry": "The primary industry category (e.g., Food & Beverage, HealthTech, FinTech)",
  "subCategory": "More specific subcategory (e.g., Juices, Cold-Pressed, Healthy Beverages)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "relatedTerms": ["related term 1", "related term 2", "related term 3"],
  "suggestedCompanies": [
    {"name": "Real Indian company example", "region": "India"},
    {"name": "Real Global company example", "region": "Global"}
  ],
  "searchStrategy": "Brief description of how to find related startups"
}

Rules:
- For Indian companies, use REAL companies like: Raw Pressery, Paper Boat, Epigamia, Slurp Farm, B Natural
- For Global companies, use REAL companies like: Bolthouse Farms, Naked Juice, Suja Juice, Evolution Fresh
- Never use placeholders like "Company X" or "Startup Y"
- Focus on the Indian market primarily, but include global context
`;

  try {
    console.log(`🔍 Analyzing search query: "${query}" using OpenAI`);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // OpenAI model format
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing startup queries and identifying relevant industries and companies. Always use REAL company names. Return ONLY valid JSON. No explanations, no markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 600
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
    
    console.log('✅ Query analyzed:', analysis.mainIndustry);
    return analysis;

  } catch (error) {
    console.error('❌ OpenAI API Error:', error);
    throw new Error(`Failed to analyze search query: ${error.message}`);
  }
};