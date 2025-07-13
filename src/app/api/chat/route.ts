import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerConfig } from '../../../config/security';

// Initialize OpenAI with server-side config
const getOpenAIClient = () => {
  const config = getServerConfig();
  if (!config.openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({
    apiKey: config.openaiApiKey,
  });
};

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get OpenAI client with secure configuration
    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful customer support assistant. Be friendly, professional, and concise in your responses. Always try to be helpful and provide clear solutions to customer problems.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    );
  }
}
