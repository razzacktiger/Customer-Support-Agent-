import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {env} from "@/config/env"

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

    const prompt = await gemini.chat.completions.create({
      model: "gemini-2.0-flash-lite",
      messages: [
        {
          role: "user",
          content: `
            Create a prompt which can act as a prompt templete where I put the original prompt and it can modify it according to my intentions so that the final modified prompt is more detailed. You can expand certain terms or keywords.
            ----------
            PROMPT: ${lastMessage.content}.
            MODIFIED PROMPT: `
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