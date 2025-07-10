import { NextRequest, NextResponse } from "next/server";
import Exa from "exa-js";

// Create Exa client using our API key
const exa = new Exa(process.env.EXA_API_KEY!);

export async function GET(request: NextRequest) {
  try {
    console.log("🕷️ Testing Exa web scraping...");

    // Search for Aven content on the web
    // This will look for pages about Aven company
    const searchResults = await exa.searchAndContents(
      "Aven company support help customer service", // What to search for
      {
        numResults: 3, // Only get 3 results (keep it small)
        useAutoprompt: true, // Let Exa make the search better
        includeDomains: ["aven.com"], // Only search Aven's website
        text: {
          maxCharacters: 500, // Keep content short for testing
          includeHtmlTags: false, // Remove HTML tags, just give us text
        },
      }
    );

    console.log(`✅ Exa found ${searchResults.results.length} results`);

    // Extract just the important info from each result
    const simpleResults = searchResults.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      snippet: result.text?.substring(0, 200) + "..." || "No content found",
      score: result.score,
    }));

    // Send back the results
    return NextResponse.json({
      success: true,
      message: `Found ${searchResults.results.length} Aven pages!`,
      results: simpleResults,
      totalFound: searchResults.results.length,
    });
  } catch (error) {
    console.error("❌ Exa test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Check if EXA_API_KEY is set in your .env.local file",
      },
      { status: 500 }
    );
  }
}
