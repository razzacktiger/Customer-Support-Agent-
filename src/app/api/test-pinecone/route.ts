import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { env } from "@/config/env";

// Create Pinecone client
const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

// Create OpenAI embeddings (this converts text to numbers)
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small", // Cheaper/faster model
});

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Testing Pinecone vector database...");

    // 1. Connect to our index (database)
    const index = pinecone.index(env.PINECONE_INDEX_NAME);

    // 2. Test text - let's store some simple Aven info
    const testText =
      "Aven is a financial company that provides mobile banking and credit card services to customers.";

    // 3. Convert text to numbers (embeddings) so AI can understand it
    console.log("🔢 Converting text to embeddings...");
    const embedding = await embeddings.embedQuery(testText);
    console.log(`✅ Created embedding with ${embedding.length} dimensions`);
    `

    // 4. Store the text and its numbers in Pinecone
    console.log("💾 Storing in Pinecone...");
    await index.upsert([
      {
        id: "test-aven-info", // Unique ID for this piece of info
        values: embedding, // The numbers representing the text
        metadata: {
          // Extra info about this text
          text: testText,
          source: "test",
          type: "company-info",
        },
      },
    ]); `;

    // 5. Test if we can find it by searching
    console.log("🔍 Testing search...");
    const searchEmbedding = await embeddings.embedQuery(
      "Is Aven a HELOC company?"
    );
    const searchResults = await index.query({
      vector: searchEmbedding,
      topK: 1, // Get 1 best match
      includeMetadata: true, // Include the original text
    });

    // 6. Get the result
    const foundMatch = searchResults.matches?.[0];

    return NextResponse.json({
      success: true,
      message: "Pinecone is working!",
      embedding_size: embedding.length,
      stored_text: testText,
      search_query: "Is Aven a HELOC company?",
      found_match: foundMatch
        ? {
            score: foundMatch.score,
            text: foundMatch.metadata?.text,
            id: foundMatch.id,
          }
        : "No match found",
    });
  } catch (error) {
    console.error("❌ Pinecone test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Check if PINECONE_API_KEY and PINECONE_INDEX_NAME are set correctly",
      },
      { status: 500 }
    );
  }
}
