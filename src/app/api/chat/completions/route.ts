import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {env} from "@/config/env"
import { Pinecone } from "@pinecone-database/pinecone";
import {GoogleGenerativeAI} from "@google/generative-ai";

const pinecone = new Pinecone({apiKey: env.PINECONE_API_KEY});
const namespace = pinecone.index("aven-pinecone-2").namespace("aven")

const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
const embeddingmodel = ai.getGenerativeModel({model: "gemini-embedding-001"})

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

    const query = lastMessage.content;

    const embedding = await embeddingmodel.embedContent(query)

    const response = await namespace.query ({
       vector: embedding.embedding.values,
       topK: 3,
       includeMetadata: true,
    });

    const context = response.matches?.map(match => match.metadata?.chunk_text).join("\n\n") || "";

    const geminiPrompt =  `Answer the question that's given to you based on the following context: ${context}
    Question: ${query}
    answer: `;
    const prompt = await gemini.chat.completions.create({
      model: "gemini-2.0-flash-lite",
      messages: [
        {
          role: "user",
          content: geminiPrompt,
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const modifiedMessage = [
      ...messages.slice(0, messages.length - 1),
      { ...lastMessage, content: prompt.choices[0].message.content },
    ];

    if (!Array.isArray(modifiedMessage) || !modifiedMessage.every(m => m.role && m.content)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    if (stream) {
      const payload = {
        model: "gemini-2.0-flash-lite",
        messages: modifiedMessage,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: true,
      };
      console.log("Gemini streaming payload:", payload);
      const completionStream = await gemini.chat.completions.create(payload as OpenAI.Chat.ChatCompletionCreateParamsStreaming);

      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completionStream) {
              const data = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        }
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      const payload = {
        model: "gemini-2.0-flash-lite",
        messages: modifiedMessage,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: false,
      };
      console.log("Gemini non-streaming payload:", payload);
      const completion = await gemini.chat.completions.create(payload);
      return NextResponse.json(completion);
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}