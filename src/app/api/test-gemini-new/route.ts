import { NextResponse } from "next/server";
import { GeminiEmbeddings } from "@/lib/embeddings/gemini-embeddings";

export async function GET() {
  try {
    console.log("🧪 Testing updated Gemini embeddings with 2025 API...");

    const embeddings = new GeminiEmbeddings();

    // Test single query
    const queryEmbedding = await embeddings.embedQuery(
      "Is Aven a HELOC company?"
    );

    console.log("✅ Query embedding generated:", {
      dimension: queryEmbedding.length,
      sampleValues: queryEmbedding.slice(0, 5),
    });

    // Test document batch
    const docs = [
      "Aven is a financial company that provides home equity lines of credit.",
      "HELOC stands for Home Equity Line of Credit.",
      "Aven offers competitive rates on credit products.",
    ];

    const docEmbeddings = await embeddings.embedDocuments(docs);

    console.log("✅ Document embeddings generated:", {
      count: docEmbeddings.length,
      dimension: docEmbeddings[0].length,
      sampleValues: docEmbeddings[0].slice(0, 5),
    });

    return NextResponse.json({
      success: true,
      message: "🎉 Gemini embeddings working perfectly with 2025 API!",
      results: {
        queryEmbedding: {
          dimension: queryEmbedding.length,
          sampleValues: queryEmbedding.slice(0, 5),
        },
        documentEmbeddings: {
          count: docEmbeddings.length,
          dimension: docEmbeddings[0].length,
          sampleValues: docEmbeddings[0].slice(0, 5),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error testing Gemini embeddings:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
