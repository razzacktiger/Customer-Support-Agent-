import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { GeminiEmbeddings } from "@/lib/embeddings/gemini-embeddings";
import { env } from "@/config/env";

// Create Pinecone client
const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

// Create Gemini embeddings (updated to use Gemini instead of OpenAI)
const embeddings = new GeminiEmbeddings();

export async function GET(request: NextRequest) {
  try {
    console.log(
      "📊 Testing Pinecone vector database with Gemini embeddings..."
    );

    // 1. Connect to our index (database)
    const index = pinecone.index(env.PINECONE_INDEX_NAME);

    // 2. Test text - let's store some simple Aven info
    const testText =
      "Aven is a financial company that provides mobile banking and credit card services to customers.";

    // 3. Convert text to numbers (embeddings) using Gemini so AI can understand it
    console.log("🔢 Converting text to Gemini embeddings...");
    const embedding = await embeddings.embedQuery(testText);
    console.log(`✅ Created embedding with ${embedding.length} dimensions`);

    // 4. Store the text and its numbers in Pinecone
    console.log("💾 Storing in Pinecone...");
    await index.upsert([
      {
        id: "test-aven-info-gemini", // Unique ID for this piece of info
        values: embedding, // The numbers representing the text
        metadata: {
          // Extra info about this text
          text: testText,
          source: "test",
          type: "company-info",
          model: "gemini-embedding-001",
        },
      },
    ]);

    // 5. Test if we can find it by searching
    console.log("🔍 Testing search...");
    const searchEmbedding = await embeddings.embedQuery(
      "Is Aven a HELOC company?"
    );
    const searchResults = await index.query({
      vector: searchEmbedding,
      topK: 3, // Get 3 best matches
      includeMetadata: true, // Include the original text
    });

    // 6. Get the result
    const foundMatch = searchResults.matches?.[0];

    return NextResponse.json({
      success: true,
      message: "Pinecone is working with Gemini embeddings!",
      embedding_size: embedding.length,
      stored_text: testText,
      search_query: "Is Aven a HELOC company?",
      found_match: foundMatch
        ? {
            score: foundMatch.score,
            text: foundMatch.metadata?.content,
            id: foundMatch.id,
            model: foundMatch.metadata?.model,
          }
        : "No match found",
      total_matches: searchResults.matches?.length || 0,
      all_matches: searchResults.matches?.map(match => ({
        id: match.id,
        score: match.score,
        text:
          typeof match.metadata?.content === "string"
            ? match.metadata.content.substring(0, 100) + "..."
            : String(match.metadata?.content || ""),
        source: match.metadata?.source,
      })),
    });
  } catch (error) {
    console.error("❌ Pinecone test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Check if PINECONE_API_KEY, PINECONE_INDEX_NAME, and GOOGLE_API_KEY are set correctly",
      },
      { status: 500 }
    );
  }
}
