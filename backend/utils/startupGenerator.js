import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Using OpenAI API key
});

export const generateRelatedStartups = async (industry, keywords, count = 5) => {
  const prompt = `
Generate ${count} REAL startup companies in the "${industry}" industry related to these keywords: ${keywords.join(', ')}

Return ONLY valid JSON with this structure:

{
  "startups": [
    {
      "name": "Real Company Name",
      "industryCategory": "${industry}",
      "subCategory": "Specific niche",
      "region": "India or Global",
      "description": "Brief 1-line description",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}

IMPORTANT RULES:
- Use ONLY REAL companies that exist
- Include a mix of INDIAN and GLOBAL companies
- For Indian companies: Raw Pressery, Paper Boat, Epigamia, B Natural, Real Fruit Juice, etc.
- For Global companies: Bolthouse Farms, Naked Juice, Suja Juice, Evolution Fresh, etc.
- Never use placeholders
- Make sure companies are relevant to "${industry}"
`;

  try {
    console.log(`🚀 Generating related startups for industry: "${industry}" using OpenAI`);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // OpenAI model format
      messages: [
        {
          role: "system",
          content: "You are a database of real startup companies. You only provide information about REAL existing companies. Return ONLY valid JSON. No explanations, no markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 800
    });

    // Validate response structure
    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from AI model');
    }

    let startupsText = response.choices[0].message.content;
    console.log('Raw response received, length:', startupsText.length);

    // Clean the response
    startupsText = startupsText
      .replace(/^```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    // Extract JSON if wrapped
    const jsonMatch = startupsText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in AI response');
    }
    startupsText = jsonMatch[0];

    // Parse the JSON
    const result = JSON.parse(startupsText);
    
    // Validate that startups array exists
    if (!result.startups || !Array.isArray(result.startups)) {
      throw new Error('Invalid response structure: missing startups array');
    }

    // Add metadata
    result.startups = result.startups.map(s => ({
      ...s,
      isAIGenerated: true,
      source: 'ai-generated'
    }));

    console.log(`✅ Generated ${result.startups.length} related startups`);
    return result.startups;

  } catch (error) {
    console.error('❌ OpenAI API Error:', error);
    throw new Error(`Failed to generate related startups: ${error.message}`);
  }
};