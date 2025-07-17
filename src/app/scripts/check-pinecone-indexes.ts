#!/usr/bin/env tsx

/**
 * Check Pinecone Indexes
 * Lists all indexes in the Pinecone account to help identify the correct one
 */

import { config } from "dotenv";
import { resolve } from "path";
import { Pinecone } from "@pinecone-database/pinecone";

// Load environment variables
config({ path: resolve(__dirname, "../../../.env.local") });

async function checkPineconeIndexes() {
  try {
    console.log("🔍 Checking Pinecone account...\n");

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    // List all indexes
    const indexes = await pinecone.listIndexes();

    console.log(
      `📊 Found ${indexes.indexes?.length || 0} index(es) in your account:\n`
    );

    if (indexes.indexes && indexes.indexes.length > 0) {
      for (const index of indexes.indexes) {
        console.log(`📝 Index: ${index.name}`);
        console.log(`   📏 Dimension: ${index.dimension}`);
        console.log(`   📊 Metric: ${index.metric}`);
        console.log(`   ☁️  Host: ${index.host}`);
        console.log(
          `   📅 Status: ${index.status?.ready ? "Ready" : "Not Ready"}`
        );
        console.log("");

        // Get detailed stats for each index
        try {
          const indexInstance = pinecone.index(index.name);
          const stats = await indexInstance.describeIndexStats();
          console.log(`   📈 Stats:`);
          console.log(`      Total Records: ${stats.totalRecordCount}`);
          console.log(`      Dimension: ${stats.dimension}`);
          console.log(`      Index Fullness: ${stats.indexFullness}`);
          if (stats.namespaces) {
            console.log(
              `      Namespaces: ${Object.keys(stats.namespaces).join(", ") || "default"}`
            );
          }
          console.log("");
        } catch (error) {
          console.log(
            `   ⚠️  Could not get stats: ${error instanceof Error ? error.message : "Unknown error"}`
          );
          console.log("");
        }
      }
    } else {
      console.log("❌ No indexes found in your account");
    }

    // Show current environment setting
    console.log("🔧 Current Configuration:");
    console.log(
      `   PINECONE_INDEX_NAME: ${process.env.PINECONE_INDEX_NAME || "NOT SET (using default: aven-support-index)"}`
    );
    console.log("");

    // Recommendations
    console.log("💡 Recommendations:");
    if (indexes.indexes?.some(idx => idx.name === "aven-pinecone-2")) {
      console.log('   ✅ Found "aven-pinecone-2" index!');
      console.log(
        "   🔧 Set environment variable: PINECONE_INDEX_NAME=aven-pinecone-2"
      );
    }
    if (indexes.indexes?.some(idx => idx.name === "aven-support-index")) {
      console.log('   ✅ Found "aven-support-index" index (current default)');
    }
    if (!indexes.indexes?.some(idx => idx.dimension === 1536)) {
      console.log(
        "   ⚠️  No index with dimension 1536 found (required for Gemini embeddings)"
      );
    }
  } catch (error) {
    console.error("❌ Error checking Pinecone:", error);
  }
}

checkPineconeIndexes();
