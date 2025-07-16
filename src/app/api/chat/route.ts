
import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from "openai";
import { env } from "@/config/env";

// Initialize clients using validated config
const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }


    console.log("💬 User question:", message);

    // Step 1: Search Pinecone for relevant Aven knowledge
    console.log("🔍 Searching knowledge base...");
    const index = pinecone.index(env.PINECONE_INDEX_NAME);

    // Convert question to embeddings
    const questionEmbedding = await embeddings.embedQuery(message);

    // Search for relevant content
    const searchResults = await index.query({
      vector: questionEmbedding,
      topK: 3, // Get top 3 most relevant pieces
      includeMetadata: true,
    });

    // Step 2: Extract relevant knowledge
    const relevantKnowledge =
      searchResults.matches
        ?.filter(match => match.score && match.score > 0.5) // Only good matches
        ?.map(match => match.metadata?.text)
        ?.filter(text => text) // Remove empty ones
        ?.join("\n\n") || "";

    console.log(
      `✅ Found ${searchResults.matches?.length || 0} knowledge pieces`
    );

    // Step 3: Create context-aware response with OpenAI
    const systemPrompt = `You are Aven's helpful customer support assistant. Use the provided knowledge to answer questions accurately and helpfully.

IMPORTANT RULES:
- Only answer questions about Aven using the provided knowledge
- If you don't know something, say "I don't have that information" 
- Be friendly and helpful
- Keep responses concise but complete
- If asked about competitors or other companies, redirect to Aven

AVEN KNOWLEDGE:
${relevantKnowledge || "No relevant knowledge found."}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 300, // Keep responses reasonable
      temperature: 0.3, // More consistent responses
    });

    const aiResponse =
      response.choices[0]?.message?.content ||
      "I apologize, but I couldn't generate a response.";

    console.log("🤖 AI Response:", aiResponse);

    return NextResponse.json({
      response: aiResponse,
      knowledgeUsed: !!relevantKnowledge,
      sourceCount: searchResults.matches?.length || 0,
    });
  } catch (error) {
    console.error("❌ Chat API error:", error);

    return NextResponse.json(
      {
        response: "I apologize, but I encountered an error. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
