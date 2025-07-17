#!/usr/bin/env tsx

/**
 * Complete Pipeline Test
 * Tests: Scraping → Embedding → Storage → Search → Chat
 */

import { config } from "dotenv";
import { resolve } from "path";
// Using built-in fetch (Node 18+)

// Load environment variables
config({ path: resolve(__dirname, "../../../.env.local") });

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  details?: any;
  error?: string;
}

class PipelineTestSuite {
  private results: TestResult[] = [];
  private baseUrl = "http://localhost:3000";

  constructor() {
    console.log("🧪 Starting Complete Pipeline Test Suite");
    console.log("=".repeat(60));
  }

  private async runTest(
    name: string,
    testFn: () => Promise<any>
  ): Promise<TestResult> {
    const startTime = Date.now();
    console.log(`\n🔍 Testing: ${name}`);

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;

      const testResult: TestResult = {
        name,
        success: true,
        duration,
        details: result,
      };

      console.log(`✅ ${name} - PASSED (${duration}ms)`);
      this.results.push(testResult);
      return testResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        name,
        success: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };

      console.log(`❌ ${name} - FAILED (${duration}ms)`);
      console.log(`   Error: ${testResult.error}`);
      this.results.push(testResult);
      return testResult;
    }
  }

  async testEnvironmentVariables() {
    return this.runTest("Environment Variables", async () => {
      const requiredVars = [
        "FIRECRAWL_API_KEY",
        "GOOGLE_API_KEY",
        "PINECONE_API_KEY",
        "PINECONE_INDEX_NAME",
        "OPENAI_API_KEY",
      ];

      const missing = requiredVars.filter(varName => !process.env[varName]);

      if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(", ")}`);
      }

      return {
        message: "All required environment variables present",
        count: requiredVars.length,
      };
    });
  }

  async testFirecrawlScraping() {
    return this.runTest("Firecrawl Scraping", async () => {
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://www.aven.com/support",
          formats: ["markdown"],
          onlyMainContent: true,
          maxAge: 3600000,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Firecrawl API failed: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as any;

      if (!data.success || !data.data?.markdown) {
        throw new Error("Firecrawl returned invalid data");
      }

      return {
        success: true,
        contentLength: data.data.markdown.length,
        url: data.data.metadata?.sourceURL || "https://www.aven.com/support",
      };
    });
  }

  async testGeminiEmbeddings() {
    return this.runTest("Gemini Embeddings", async () => {
      const { GoogleGenAI } = await import("@google/genai");

      const client = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY!,
      });

      // Test embedding generation
      const testText =
        "Aven is a financial company that provides mobile banking services.";
      const response = await client.models.embedContent({
        model: "gemini-embedding-001",
        contents: testText,
        config: {
          taskType: "RETRIEVAL_QUERY",
          outputDimensionality: 1536,
        },
      });

      const embedding = response.embeddings?.[0]?.values;
      if (!embedding || embedding.length === 0) {
        throw new Error("Failed to generate embeddings");
      }

      return {
        dimensions: embedding.length,
        sampleValues: embedding.slice(0, 5),
        textLength: testText.length,
        model: "gemini-embedding-001",
      };
    });
  }

  async testPineconeConnection() {
    return this.runTest("Pinecone Connection", async () => {
      const { Pinecone } = await import("@pinecone-database/pinecone");

      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

      // Test basic connection and stats
      const stats = await index.describeIndexStats();

      return {
        vectorCount: stats.totalRecordCount,
        dimension: stats.dimension,
        indexFullness: stats.indexFullness,
        namespaces: Object.keys(stats.namespaces || {}),
      };
    });
  }

  async testChatAPI() {
    return this.runTest("Chat API", async () => {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "What is Aven?",
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Chat API failed: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as any;

      if (!data.response) {
        throw new Error("Chat API returned no response");
      }

      return {
        response: data.response,
        knowledgeUsed: data.knowledgeUsed,
        sourceCount: data.sourceCount,
        responseLength: data.response.length,
      };
    });
  }

  async testConfigAPI() {
    return this.runTest("Config API", async () => {
      const response = await fetch(`${this.baseUrl}/api/config`);

      if (!response.ok) {
        throw new Error(
          `Config API failed: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as any;

      if (!data.vapiApiKey || !data.vapiAssistantId) {
        throw new Error("Config API missing required fields");
      }

      return {
        hasVapiKey: !!data.vapiApiKey,
        hasAssistantId: !!data.vapiAssistantId,
      };
    });
  }

  async testSearchAccuracy() {
    return this.runTest("Search Accuracy", async () => {
      const testQueries = [
        "What is Aven?",
        "How do I contact customer support?",
        "What services does Aven provide?",
        "How do I apply for a credit card?",
      ];

      const results = [];

      for (const query of testQueries) {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: query }),
        });

        const data = (await response.json()) as any;
        results.push({
          query,
          responseLength: data.response?.length || 0,
          knowledgeUsed: data.knowledgeUsed,
          sourceCount: data.sourceCount,
        });
      }

      const avgResponseLength =
        results.reduce((acc, r) => acc + r.responseLength, 0) / results.length;
      const knowledgeUsageRate =
        results.filter(r => r.knowledgeUsed).length / results.length;

      return {
        totalQueries: testQueries.length,
        avgResponseLength,
        knowledgeUsageRate,
        results,
      };
    });
  }

  async runAllTests() {
    console.log("🚀 Running all tests...\n");

    // Run tests in order
    await this.testEnvironmentVariables();
    await this.testFirecrawlScraping();
    await this.testGeminiEmbeddings();
    await this.testPineconeConnection();

    console.log(
      "\n⏸️  Starting Next.js server tests (make sure your dev server is running!)"
    );
    await new Promise(resolve => setTimeout(resolve, 2000));

    await this.testConfigAPI();
    await this.testChatAPI();
    await this.testSearchAccuracy();

    this.printSummary();
  }

  private printSummary() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalTime = this.results.reduce((acc, r) => acc + r.duration, 0);

    console.log(`\n✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(
      `📈 Success Rate: ${Math.round((passed / this.results.length) * 100)}%`
    );

    if (failed > 0) {
      console.log("\n❌ FAILED TESTS:");
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }

    if (passed === this.results.length) {
      console.log("\n🎉 All tests passed! Your pipeline is working correctly.");
    } else {
      console.log(
        `\n⚠️  ${failed} test(s) failed. Please address the issues above.`
      );
    }
  }
}

// Run the tests
async function main() {
  const testSuite = new PipelineTestSuite();
  await testSuite.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}
