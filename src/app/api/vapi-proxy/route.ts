import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { action } = await req.json();
  const apiKey = process.env.VAPI_API_KEY;
  const assistantId = process.env.VAPI_ASSISTANT_ID;

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

  const data = await vapiRes.json();
  return NextResponse.json(data);
} 