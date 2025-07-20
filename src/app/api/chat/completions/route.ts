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
    const { model, messages, max_tokens, temperature, stream, top_p, stop } =
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

    // Debug: Log what Pinecone actually returned
    console.log(
      "🔍 Debug - Pinecone matches:",
      searchResults.matches?.map(match => ({
        score: match.score,
        content:
          typeof match.metadata?.content === "string"
            ? (match.metadata.content as string).substring(0, 100) + "..."
            : String(match.metadata?.content || "No content"),
      }))
    );

    console.log(
      "📝 Debug - Relevant knowledge extracted:",
      relevantKnowledge
        ? relevantKnowledge.substring(0, 200) + "..."
        : "No knowledge extracted"
    );

    // Step 3: Create context-aware system prompt
    const systemPrompt = `You are Aven's helpful customer support assistant. Use the provided knowledge to answer questions accurately and helpfully.

IMPORTANT RULES:
- Only answer questions about Aven using the provided knowledge
- If someone asks about "Avon", clarify they might mean "Aven" - these are different companies
- If you don't know something, say "I don't have that information" 
- Be friendly and helpful
- Keep responses concise but complete
- Always use the exact information from the AVEN KNOWLEDGE below

AVEN KNOWLEDGE:
${relevantKnowledge || "No relevant knowledge found."}`;

    // Step 4: Create messages with system prompt
    // Filter out any existing system messages to avoid conflicts
    const userMessages = messages.filter((msg: any) => msg.role !== "system");
    const messagesWithContext = [
      { role: "system", content: systemPrompt },
      ...userMessages,
    ];

    // Debug: Log the system prompt being sent
    console.log(
      "🤖 Debug - System prompt:",
      systemPrompt.substring(0, 300) + "..."
    );
    console.log(
      "📬 Debug - Messages being sent:",
      JSON.stringify(messagesWithContext, null, 2)
    );

    if (stream) {
      const completionStream = await gemini.chat.completions.create({
        model: model || "gemini-2.5-flash",
        messages: messagesWithContext,
        max_tokens: max_tokens || 800,
        temperature: temperature || 0.7,
        stream: true,
        ...(top_p && { top_p }),
        ...(stop && { stop }),
      } as OpenAI.Chat.ChatCompletionCreateParamsStreaming);

      const encoder = new TextEncoder();
      let streamedResponse = ""; // Track the full response
      const readable = new ReadableStream({
        async start(controller) {
          for await (const data of completionStream) {
            // Log each chunk for debugging
            if (data.choices?.[0]?.delta?.content) {
              streamedResponse += data.choices[0].delta.content;
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          }
          controller.close();
          // Log the complete streamed response
          console.log("🤖 Complete AI Streaming Response:", streamedResponse);
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    } else {
      const completion = await gemini.chat.completions.create({
        model: model || "gemini-2.5-flash-lite-preview-06-17",
        messages: messagesWithContext,
        max_tokens: max_tokens || 800,
        temperature: temperature || 0.7,
        stream: false,
        ...(top_p && { top_p }),
        ...(stop && { stop }),
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
