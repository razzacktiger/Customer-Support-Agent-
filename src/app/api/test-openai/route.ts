import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

// Create OpenAI client using our API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing OpenAI connection...");

    // Make a simple request to OpenAI - just ask it to say hello
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say hello and confirm you are working. Keep it short.",
        },
      ],
      max_tokens: 50, // Keep response small
    });

    // Get the AI's response
    const aiMessage = response.choices[0]?.message?.content || "No response";

    console.log("✅ OpenAI responded:", aiMessage);

    // Send success response back to our website
    return NextResponse.json({
      success: true,
      message: "OpenAI is working!",
      aiResponse: aiMessage,
      model: response.model,
    });
  } catch (error) {
    console.error("❌ OpenAI test failed:", error);

    // Send error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
