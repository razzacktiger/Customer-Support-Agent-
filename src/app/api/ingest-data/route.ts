import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { env } from "@/config/env";

const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

export async function POST(request: NextRequest) {
  try {
    const { documents } = await request.json();

    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: "Documents array is required" },
        { status: 400 }
      );
    }

    console.log(`📄 Processing ${documents.length} documents...`);

    const indexName = env.PINECONE_INDEX_NAME;
    const index = pinecone.index(indexName);

    // Text splitter for large documents
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const allChunks = [];

    for (const doc of documents) {
      const { content, metadata = {} } = doc;

      // Split large content into chunks
      const chunks = await textSplitter.splitText(content);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await embeddings.embedQuery(chunk);

        allChunks.push({
          id: `${metadata.id || Date.now()}-chunk-${i}`,
          values: embedding,
          metadata: {
            text: chunk,
            source: metadata.source || "manual",
            type: metadata.type || "document",
            title: metadata.title || "Untitled",
            url: metadata.url || "",
            chunkIndex: i,
            totalChunks: chunks.length,
          },
        });
      }
    }

    // Batch upsert to Pinecone
    const batchSize = 100;
    let processedCount = 0;

    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      await index.upsert(batch);
      processedCount += batch.length;
      console.log(`✅ Processed ${processedCount}/${allChunks.length} chunks`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${documents.length} documents`,
      chunksCreated: allChunks.length,
      documentsProcessed: documents.length,
    });
  } catch (error) {
    console.error("❌ Data ingestion failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
