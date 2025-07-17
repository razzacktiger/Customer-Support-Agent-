import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {env} from "@/config/env"
import { Pinecone } from "@pinecone-database/pinecone";
import {GeminiEmbeddings} from "@/lib/embeddings/gemini-embeddings";

const pinecone = new Pinecone({apiKey: env.PINECONE_API_KEY});
const index = pinecone.index(env.PINECONE_INDEX_NAME);

const embeddings = new GeminiEmbeddings();

const gemini = new OpenAI({ apiKey: env.GOOGLE_API_KEY, 
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" });

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid or missing JSON in request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const {
      model,
      messages,
      max_tokens,
      temperature,
      stream,
      call,
      ...restParams
    } = body;

    const lastMessage = messages?.[messages.length - 1];

    // Only respond if the last message is from the user
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ error: "No user message to respond to." }, { status: 400 });
    }

    const query = lastMessage.content;

         const embedding = await embeddings.embedQuery(query);

    const response = await index.query ({
       vector: embedding,
       topK: 3,
       includeMetadata: true,
    });

    // Use only the top match for context
    const contextString = response.matches?.[0]?.metadata?.text || "";

    // Extract the most relevant sentence from the context
    function extractMostRelevantSentence(context: string, query: string): string {
      const sentences = context.split(/(?<=[.!?])\s+/);
      const queryWords = new Set(query.toLowerCase().split(/\W+/));
      let bestSentence = "";
      let bestScore = -1; // allow zero-overlap
      for (const sentence of sentences) {
        const sentenceWords = new Set(sentence.toLowerCase().split(/\W+/));
        const overlap = [...sentenceWords].filter(w => queryWords.has(w)).length;
        if (overlap > bestScore) {
          bestScore = overlap;
          bestSentence = sentence;
        }
      }
      return bestSentence.trim();
    }
    // Ensure contextString and query are strings
    const safeContext = typeof contextString === 'string' ? contextString : '';
    const safeQuery = typeof query === 'string' ? query : '';
    const relevantContext = extractMostRelevantSentence(safeContext, safeQuery);

    // If Pinecone returned any context, use the best sentence; otherwise, say no info
    const answer = relevantContext || "I'm sorry, I don't have that information.";

    // Return the answer directly, skipping LLM generation
    return NextResponse.json({
      choices: [
        {
          message: {
            role: "assistant",
            content: answer,
          }
        }
      ]
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}