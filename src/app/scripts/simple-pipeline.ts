/**
 * Simple standalone pipeline: Firecrawl → Gemini → Pinecone
 * No complex imports, just direct environment access
 */

// Load environment variables
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import * as path from "path";

// Simple logger
const log = (message: string, data?: any) => {
  console.log(`🚀 ${message}`, data ? JSON.stringify(data, null, 2) : "");
};

// Simple Gemini Embeddings (standalone version)
class SimpleGeminiEmbeddings {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_API_KEY is required");

    this.client = new GoogleGenAI({ apiKey });
  }

  async embedQuery(text: string): Promise<number[]> {
    const response = await this.client.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: 1536,
      },
    });

    const embedding = response.embeddings?.[0]?.values;
    if (!embedding) throw new Error("Failed to generate embedding");

    // Normalize
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    return magnitude === 0 ? embedding : embedding.map(val => val / magnitude);
  }
}

// Step 1: Scrape with Firecrawl
async function scrapeWithFirecrawl(url: string) {
  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
  if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is required");

  log(`🔍 Scraping: ${url}`);

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: url,
      formats: ["markdown"],
      onlyMainContent: true,
      removeBase64Images: true,
      maxAge: 3600000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`Scraping failed: ${data.error}`);
  }

  return {
    url,
    title: data.data?.metadata?.title || `Page from ${new URL(url).hostname}`,
    content: data.data?.markdown || data.data?.html || "",
    scrapedAt: new Date().toISOString(),
  };
}

// Main pipeline
async function runSimplePipeline() {
  const startTime = Date.now();
  log("Starting Simple Firecrawl → Gemini → Pinecone Pipeline");

  try {
    // Check required environment variables
    const requiredVars = [
      "FIRECRAWL_API_KEY",
      "GOOGLE_API_KEY",
      "PINECONE_API_KEY",
    ];
    const missing = requiredVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(", ")}`);
    }

    // Initialize services
    const embeddings = new SimpleGeminiEmbeddings();
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(
      process.env.PINECONE_INDEX_NAME || "aven-support-index"
    );

    // URLs to scrape
    const urls = [
      "https://www.aven.com/support",
      "https://www.aven.com/faq",
      "https://www.aven.com/heloc-refinance",
      "https://www.aven.com/how-it-works",
    ];

    log(`📋 Will scrape ${urls.length} URLs`);

    // Step 1: Scrape all URLs
    const scrapedData = [];
    for (const url of urls) {
      try {
        const result = await scrapeWithFirecrawl(url);
        scrapedData.push(result);
        log(`✅ Scraped: ${result.title}`);
      } catch (error) {
        log(`❌ Failed to scrape ${url}: ${error}`);
      }
    }

    log(`📄 Successfully scraped ${scrapedData.length} pages`);

    // Step 2: Embed content
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const allVectors = [];

    for (const page of scrapedData) {
      log(`🧠 Embedding: ${page.title}`);

      const chunks = await textSplitter.splitText(page.content);
      log(`  📝 Split into ${chunks.length} chunks`);

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await embeddings.embedQuery(chunks[i]);

        allVectors.push({
          id: `${page.url.replace(/[^a-zA-Z0-9]/g, "_")}_chunk_${i}`,
          values: embedding,
          metadata: {
            content: chunks[i],
            url: page.url,
            title: page.title,
            chunkIndex: i,
            totalChunks: chunks.length,
            scrapedAt: page.scrapedAt,
          },
        });

        log(
          `  ✅ Chunk ${i + 1}/${chunks.length} embedded (${embedding.length}d)`
        );
      }
    }

    log(`🔢 Total vectors to store: ${allVectors.length}`);

    // Step 3: Store in Pinecone
    const batchSize = 100;
    for (let i = 0; i < allVectors.length; i += batchSize) {
      const batch = allVectors.slice(i, i + batchSize);
      log(
        `📤 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allVectors.length / batchSize)}...`
      );
      await index.upsert(batch);
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
    }

    // Test search
    log("🧪 Testing search...");
    const testQuery = "Is Aven a HELOC company?";
    const queryEmbedding = await embeddings.embedQuery(testQuery);
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    log("🎯 Search results:", {
      query: testQuery,
      matches: searchResults.matches?.map(match => ({
        score: match.score,
        title: match.metadata?.title,
        text: (match.metadata?.content as string)?.substring(0, 100) + "...",
      })),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`🎉 Pipeline completed successfully in ${duration}s!`);
    log("🔍 Your RAG system is now ready for queries");
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`❌ Pipeline failed after ${duration}s: ${error}`);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runSimplePipeline().catch(console.error);
}

export { runSimplePipeline };
