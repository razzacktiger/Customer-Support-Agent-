import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: "text-embedding-3-small",
});

export async function POST(req: NextRequest) {
  try {
    const { action, transcript } = await req.json();
    const apiKey = process.env.VAPI_API_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;

    // If this is a transcript from voice, use RAG to get context
    if (transcript) {
      console.log("🎤 Processing voice transcript:", transcript);

      // Search knowledge base for relevant context
      const indexName = process.env.PINECONE_INDEX_NAME || "aven-support-index";
      const index = pinecone.index(indexName);

      const questionEmbedding = await embeddings.embedQuery(transcript);

      const searchResults = await index.query({
        vector: questionEmbedding,
        topK: 3,
        includeMetadata: true,
      });

      const relevantKnowledge =
        searchResults.matches
          ?.filter(match => match.score && match.score > 0.5)
          ?.map(match => match.metadata?.text)
          ?.filter(text => text)
          ?.join("\n\n") || "";

      console.log(
        `✅ Found ${searchResults.matches?.length || 0} knowledge pieces for voice`
      );

      // Return the knowledge to be used in the voice response
      return NextResponse.json({
        success: true,
        knowledge: relevantKnowledge,
        sourceCount: searchResults.matches?.length || 0,
      });
    }

    // Original VAPI functionality
    const endpoint = `https://api.vapi.ai/v1/assistants/${assistantId}/calls`;

    let payload = {};
    if (action === "start") {
      payload = {
        /* Add Vapi start call payload here */
      };
    } else if (action === "end") {
      payload = {
        /* Add Vapi end call payload here */
      };
    }

    const vapiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await vapiRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ VAPI Proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
