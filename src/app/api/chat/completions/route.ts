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
    body = await NextResponse.json();
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
    if (!lastMessage) {
      return NextResponse.json({ error: "No user message provided." }, { status: 400 });
    }

    // Use Gemini chat completions to modify the prompt
    const prompt = await gemini.chat.completions.create({
      model: "gemini-2.0-flash-lite",
      messages: [
        {
          role: "user",
          content: `\nCreate a prompt which can act as a prompt templete where I put the original prompt and it can modify it according to my intentions so that the final modified prompt is more detailed. You can expand certain terms or keywords.\n----------\nPROMPT: ${lastMessage.content}.\nMODIFIED PROMPT: `,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const modifiedMessage = [
      ...messages.slice(0, messages.length - 1),
      { ...lastMessage, content: prompt.choices[0].message.content },
    ];

    if (stream) {
      const completionStream = await gemini.chat.completions.create({
        model: model || "gpt-3.5-turbo",
        ...restParams,
        messages: modifiedMessage,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: true,
      } as OpenAI.Chat.ChatCompletionCreateParamsStreaming);

      for await (const data of completionStream) {
        NextResponse.write(`data: ${JSON.stringify(data)}\n\n`);
      }
      NextResponse.end();
    } else {
      const completion = await gemini.chat.completions.create({
        model: model || "gemini-1.5-flash-latest",
        ...restParams,
        messages: modifiedMessage,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: false,
      });
      return NextResponse.json(completion, { status: 200 });
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}