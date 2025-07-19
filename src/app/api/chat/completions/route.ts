import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { env } from "@/config/env";
import { Pinecone } from "@pinecone-database/pinecone";
import { GeminiEmbeddings } from "@/lib/embeddings/gemini-embeddings";

const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY });
const index = pinecone.index(env.PINECONE_INDEX_NAME);

const embeddings = new GeminiEmbeddings();

const gemini = new OpenAI({
  apiKey: env.GOOGLE_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing JSON in request body" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { model, messages, max_tokens, temperature, stream, ...restParams } =
      body;

    const lastMessage = messages?.[messages.length - 1];
    if (!lastMessage) {
      return NextResponse.json(
        { error: "No user message provided." },
        { status: 400 }
      );
    }

    console.log("💬 User question:", lastMessage.content);

    // Step 1: Search Pinecone for relevant Aven knowledge
    console.log("🔍 Searching knowledge base...");

    // Convert question to embeddings using Gemini
    const questionEmbedding = await embeddings.embedQuery(lastMessage.content);

    // Search for relevant content in Pinecone
    const searchResults = await index.query({
      vector: questionEmbedding,
      topK: 3, // Get top 3 most relevant pieces
      includeMetadata: true,
    });

    // Step 2: Extract relevant knowledge
    const relevantKnowledge =
      searchResults.matches
        ?.filter(match => match.score && match.score > 0.5) // Only good matches
        ?.map(match => match.metadata?.content)
        ?.filter(content => content) // Remove empty ones
        ?.join("\n\n") || "";

    console.log(
      `✅ Found ${searchResults.matches?.length || 0} knowledge pieces`
    );

    // Step 3: Create context-aware system prompt
    const systemPrompt = `You are Aven's helpful customer support assistant. Use the provided knowledge to answer questions accurately and helpfully.

IMPORTANT RULES:
- Only answer questions about Aven using the provided knowledge
- If you don't know something, say "I don't have that information" 
- Be friendly and helpful
- Keep responses concise but complete
- If asked about competitors or other companies, redirect to Aven

AVEN KNOWLEDGE:
${relevantKnowledge || "No relevant knowledge found."}`;

    // Step 4: Create messages with system prompt
    const messagesWithContext = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    if (stream) {
      const completionStream = await gemini.chat.completions.create({
        model: model || "gemini-2.0-flash-lite",
        ...restParams,
        messages: messagesWithContext,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: true,
      } as OpenAI.Chat.ChatCompletionCreateParamsStreaming);

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          for await (const data of completionStream) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          }
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    } else {
      const completion = await gemini.chat.completions.create({
        model: model || "gemini-2.0-flash-lite",
        ...restParams,
        messages: messagesWithContext,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: false,
      });

      console.log("🤖 AI Response:", completion.choices[0]?.message?.content);

      return NextResponse.json(completion, { status: 200 });
    }
  } catch (e) {
    console.error("❌ Chat completions error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
