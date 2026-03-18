
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY, 
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000
});

export const extractIdeaInfo = async (idea) => {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      industry: z.string().describe('The main industry category'),
      subCategory: z.string().describe('Specific subcategory'),
      keywords: z.array(z.string()).describe('5-7 relevant keywords'),
      businessModel: z.string().describe('Likely business model'),
      targetMarket: z.string().describe('Target market description'),
      customerSegments: z.array(z.string()).describe('Customer segments')
    })
  );

  const prompt = PromptTemplate.fromTemplate(`
    Analyze this startup idea and extract structured information.
    
    Startup Idea: {idea}
    
    Focus on the Indian market context. Be specific and detailed.
    
    {format_instructions}
  `);

  const chain = RunnableSequence.from([
    prompt,
    llm,
    parser
  ]);

  try {
    const result = await chain.invoke({
      idea,
      format_instructions: parser.getFormatInstructions()
    });
    
    return result;
  } catch (error) {
    console.error('Extraction error:', error);
    throw error;
  }
};

// Step 2: Enhance analysis with retrieved data
export const enhanceAnalysisWithRetrievedData = async (idea, extractedInfo, retrievedStartups) => {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      overview: z.string().describe('2-3 sentence overview'),
      marketOpportunity: z.object({
        marketSize: z.string().describe('Market size in ₹'),
        growthRate: z.string().describe('Growth rate'),
        keyTrends: z.array(z.string()).describe('3-4 key trends')
      }),
      competitors: z.array(z.object({
        name: z.string(),
        threat: z.string().describe('High/Medium/Low'),
        differentiator: z.string().describe('How they differ')
      })).describe('3-5 key competitors'),
      risks: z.array(z.string()).describe('4-5 specific risks for Indian market'),
      feasibilityScore: z.number().min(1).max(10),
      recommendations: z.array(z.string()).describe('3-4 actionable recommendations'),
      swot: z.object({
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        opportunities: z.array(z.string()),
        threats: z.array(z.string())
      })
    })
  );

  const prompt = PromptTemplate.fromTemplate(`
    You are an expert startup analyst. Analyze this startup idea with context from similar startups.
    
    ORIGINAL IDEA: {idea}
    
    EXTRACTED INFORMATION:
    - Industry: {industry}
    - Sub-category: {subCategory}
    - Keywords: {keywords}
    - Business Model: {businessModel}
    - Target Market: {targetMarket}
    - Customer Segments: {customerSegments}
    
    SIMILAR STARTUPS FOUND:
    {retrievedData}
    
    Based on the original idea and these similar startups, provide a comprehensive analysis.
    Consider the Indian market context, competitive landscape, and unique value proposition.
    
    {format_instructions}
  `);

  const chain = RunnableSequence.from([
    prompt,
    llm,
    parser
  ]);

  try {
    const result = await chain.invoke({
      idea,
      industry: extractedInfo.industry,
      subCategory: extractedInfo.subCategory,
      keywords: extractedInfo.keywords.join(', '),
      businessModel: extractedInfo.businessModel,
      targetMarket: extractedInfo.targetMarket,
      customerSegments: extractedInfo.customerSegments.join(', '),
      retrievedData: JSON.stringify(retrievedStartups, null, 2),
      format_instructions: parser.getFormatInstructions()
    });
    
    return result;
  } catch (error) {
    console.error('Analysis enhancement error:', error);
    throw error;
  }
};

// Step 3: Generate final summary
export const generateFinalSummary = async (idea, extractedInfo, retrievedStartups, analysis) => {
  const prompt = PromptTemplate.fromTemplate(`
    Create a comprehensive executive summary for this startup analysis.
    
    Original Idea: {idea}
    
    Industry: {industry}
    Target Market: {targetMarket}
    
    Similar Startups Found: {startupCount}
    
    Key Findings:
    - Feasibility Score: {feasibilityScore}/10
    - Market Size: {marketSize}
    - Growth Rate: {growthRate}
    
    Write a compelling 3-4 paragraph summary that highlights:
    1. The core opportunity
    2. Competitive landscape
    3. Key risks and challenges
    4. Overall feasibility and next steps
    
    Make it actionable and insightful for an entrepreneur.
  `);

  const chain = RunnableSequence.from([
    prompt,
    llm,
    new StringOutputParser()
  ]);

  try {
    const summary = await chain.invoke({
      idea,
      industry: extractedInfo.industry,
      targetMarket: extractedInfo.targetMarket,
      startupCount: retrievedStartups.length,
      feasibilityScore: analysis.feasibilityScore,
      marketSize: analysis.marketOpportunity.marketSize,
      growthRate: analysis.marketOpportunity.growthRate
    });
    
    return summary;
  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
};