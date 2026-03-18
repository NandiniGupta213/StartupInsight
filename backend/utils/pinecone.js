import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Document } from '@langchain/core/documents';
import crypto from 'crypto';

// Initialize Pinecone
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const indexName = process.env.PINECONE_INDEX || 'startup-embeddings';

// Initialize embeddings with OpenAI
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY, // OpenAI API key for embeddings
  modelName: 'text-embedding-3-small',
  maxRetries: 3,
  maxConcurrency: 5
});

// Get or create Pinecone index
export const initializePinecone = async () => {
  try {
    // Check if index exists
    const existingIndexes = await pc.listIndexes();
    const indexExists = existingIndexes.indexes?.some(idx => idx.name === indexName);
    
    if (!indexExists) {
      console.log(`Creating index: ${indexName}`);
      await pc.createIndex({
        name: indexName,
        dimension: 1536, // OpenAI embedding dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      // Wait for index to be ready
      console.log('Waiting 60 seconds for index to initialize...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
    
    return pc.index(indexName);
  } catch (error) {
    console.error('Pinecone initialization error:', error);
    throw error;
  }
};

// Get Pinecone vector store
export const getPineconeStore = async () => {
  const index = await initializePinecone();
  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    maxConcurrency: 5,
    textKey: 'text'
  });
};

// Generate embedding for text
export const generateEmbedding = async (text) => {
  try {
    const embedding = await embeddings.embedQuery(text);
    return embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw error;
  }
};

// Search for similar startups
export const searchSimilarStartups = async (query, topK = 5) => {
  try {
    const store = await getPineconeStore();
    const results = await store.similaritySearchWithScore(query, topK);
    
    return results.map(([doc, score]) => ({
      name: doc.metadata.name || 'Unknown',
      description: doc.pageContent,
      category: doc.metadata.category || 'General',
      founded: doc.metadata.founded || 'N/A',
      funding: doc.metadata.funding || 'N/A',
      similarity: score,
      metadata: doc.metadata
    }));
  } catch (error) {
    console.error('Pinecone search error:', error);
    return [];
  }
};

// Add startup to Pinecone
export const addStartupToPinecone = async (startupData) => {
  try {
    const id = crypto.randomUUID();
    const doc = new Document({
      pageContent: startupData.description || startupData.overview,
      metadata: {
        id,
        name: startupData.name,
        category: startupData.category,
        founded: startupData.founded || new Date().getFullYear().toString(),
        funding: startupData.funding || 'N/A',
        source: startupData.source || 'api-generated',
        timestamp: new Date().toISOString()
      }
    });
    
    const store = await getPineconeStore();
    await store.addDocuments([doc]);
    
    return id;
  } catch (error) {
    console.error('Error adding to Pinecone:', error);
    throw error;
  }
};

// Batch add multiple startups to Pinecone
export const addStartupsToPinecone = async (startups) => {
  try {
    const docs = startups.map((startup, index) => {
      const id = crypto.randomUUID();
      return new Document({
        pageContent: startup.description || startup.overview,
        metadata: {
          id,
          name: startup.name,
          category: startup.category,
          founded: startup.founded || 'N/A',
          funding: startup.funding || 'N/A',
          source: startup.source || 'batch-upload',
          timestamp: new Date().toISOString(),
          index
        }
      });
    });
    
    const store = await getPineconeStore();
    await store.addDocuments(docs);
    
    return docs.map(doc => doc.metadata.id);
  } catch (error) {
    console.error('Error batch adding to Pinecone:', error);
    throw error;
  }
};