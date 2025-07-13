import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse request body with error handling
    let action: string;
    try {
      const body = await req.json();
      action = body.action;
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input
    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid action parameter' },
        { status: 400 }
      );
    }

    if (action !== 'start' && action !== 'end') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "start" or "end"' },
        { status: 400 }
      );
    }

    const apiKey = process.env.VAPI_API_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;

    // Check if environment variables are configured
    if (!apiKey || !assistantId) {
      console.error('Missing VAPI configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Example: Replace with the actual Vapi endpoint and payload
    const endpoint = `https://api.vapi.ai/v1/assistants/${assistantId}/calls`;

    let payload = {};
    if (action === "start") {
      payload = { /* Add Vapi start call payload here */ };
    } else if (action === "end") {
      payload = { /* Add Vapi end call payload here */ };
    }

    const vapiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Check if the API call was successful
    if (!vapiRes.ok) {
      const errorText = await vapiRes.text();
      console.error('Vapi API error:', vapiRes.status, errorText);
      return NextResponse.json(
        { error: 'External API error', details: errorText },
        { status: vapiRes.status }
      );
    }

    const data = await vapiRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in vapi-proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 