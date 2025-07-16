import OpenAI from "openai";
import { env } from "process";
import { NextRequest, NextResponse } from "next/server";

const gemini = new OpenAI({ 
    apiKey: env.GOOGLE_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
 });

// Simple logger utility
function logger(...args: any[]) {
  console.log('[API/chat/completions]', ...args);
}

export default async (req: NextRequest) => {
  logger('Received request:', req.method);
  if (req.method !== "POST") {
    logger('Method not allowed:', req.method);
    return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    logger('Request body:', body);
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
    logger('Last message:', lastMessage);
    const prompt = await gemini.chat.completions.create({
      model: "gemini-2.0-flash-lite",
      messages: [
        {
          role: "user",
          content: `
            Create a prompt which can act as a prompt templete where I put the original prompt and it can modify it according to my intentions so that the final modified prompt is more detailed.You can expand certain terms or keywords.
            ----------
            PROMPT: ${lastMessage.content}.
            MODIFIED PROMPT: `,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    logger('Prompt completion:', prompt);

    const modifiedMessage = [
      ...messages.slice(0, messages.length - 1),
      { ...lastMessage, content: prompt.choices[0].message.content},
    ];
    logger('Modified message:', modifiedMessage);

    if (stream) {
      logger('Streaming response enabled');
      const completionStream = await gemini.chat.completions.create({
        model: model || "gemini-2.0-flash-lite",
        ...restParams,
        messages: modifiedMessage,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: true,
      } as OpenAI.Chat.ChatCompletionCreateParamsStreaming);
      const encoder = new TextEncoder();
      const streamResponse = new ReadableStream({
        async start(controller) {
          for await (const data of completionStream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }
          controller.close();
        }
      });
      logger('Returning stream response');
      return new NextResponse(streamResponse, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        }
      });
    } else {
      logger('Non-streaming response');
      const completion = await gemini.chat.completions.create({
        model: model || "gpt-3.5-turbo",
        ...restParams,
        messages: modifiedMessage,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: false,
      });
      logger('Completion result:', completion);
      return NextResponse.json(completion, { status: 200 });
    }
  } catch (e) {
    logger('Error occurred:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
};