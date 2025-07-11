import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

// Create Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function GET(request: NextRequest) {
  try {
    console.log("🏗️ Creating Pinecone database...");

    const indexName = process.env.PINECONE_INDEX_NAME || "aven-support-index";

    // 1. Check if database already exists
    console.log(`🔍 Checking if ${indexName} exists...`);
    const indexList = await pinecone.listIndexes();
    const indexExists = indexList.indexes?.some(
      index => index.name === indexName
    );

    if (indexExists) {
      console.log("✅ Database already exists!");
      return NextResponse.json({
        success: true,
        message: `Database '${indexName}' already exists!`,
        action: "already_exists",
        indexName: indexName,
      });
    }

    // 2. Create the database if it doesn't exist
    console.log(`🏗️ Creating new database: ${indexName}`);
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // Size for OpenAI text-embedding-3-small
      metric: "cosine", // How to measure similarity
      spec: {
        serverless: {
          cloud: "aws", // Use Amazon servers
          region: "us-east-1", // Close to most users
        },
      },
    });

    console.log("✅ Database created successfully!");
    console.log("⏳ Database is initializing... (takes ~60 seconds)");

    return NextResponse.json({
      success: true,
      message: `Database '${indexName}' created successfully!`,
      action: "created",
      indexName: indexName,
      note: "Database is initializing... Wait ~60 seconds before testing.",
    });
  } catch (error) {
    console.error("❌ Failed to create database:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Check if PINECONE_API_KEY is set correctly in your .env.local file",
      },
      { status: 500 }
    );
  }
}
