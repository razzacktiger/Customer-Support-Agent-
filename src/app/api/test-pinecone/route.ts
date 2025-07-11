import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

// Create Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Create OpenAI embeddings (this converts text to numbers)
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: "text-embedding-3-small", // Cheaper/faster model
});

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Testing Pinecone vector database...");

    // 1. Connect to our index (database)
    const indexName = process.env.PINECONE_INDEX_NAME || "aven-support-index";
    const index = pinecone.index(indexName);

    // 2. Test text - let's store some simple Aven info
    const testText = `Aven is a financial company that provides mobile banking and credit card services to customers. 
      SUPPORT

      ## How can we help?

      Search question, keywords, or topics

      Message Us

      Schedule A Callback

      ##### Trending Articles

      - Is the rate variable? ![down](https://www.aven.com/img/down.bb266b57.svg)
      The Aven Card is a variable rate credit card. Cash outs may have a fixed rate option. See your offer for details. The variable rate varies based on an Index (Prime Rate published in the Wall Street Journal or the Federal Funds Target Rate Upper Limit set by the Federal Reserve). This is outside Aven's control. As the Index shifts up or down, so will the APR on the Aven Card and any other variable-rate credit cards, lines, and loans. The Index may change several times a year or go for many months without change.

      - How does Aven determine the credit line size and interest rate? ![down](https://www.aven.com/img/down.bb266b57.svg)
      Aven's bank-standard underwriting system is fully automated, and calculates offers based on an applicant's income, equity, credit, and debt obligations.

      - Does Aven offer a fixed rate? ![down](https://www.aven.com/img/down.bb266b57.svg)
      Some Aven cardholders may be able to create fixed payment, fixed rate Simple Loan plans. Applicants can check their details in their account agreement.

      - Is Aven a credit card or a home equity line of credit? ![down](https://www.aven.com/img/down.bb266b57.svg)
      It is both! Aven is a home equity line of credit that customers access through a credit card. Aven cardholders can use their Aven Card wherever VISA cards are accepted.
      `;

    // 3. Convert text to numbers (embeddings) so AI can understand it
    console.log("🔢 Converting text to embeddings...");
    const embedding = await embeddings.embedQuery(testText);
    console.log(`✅ Created embedding with ${embedding.length} dimensions`);

    // 4. Store the text and its numbers in Pinecone
    console.log("💾 Storing in Pinecone...");
    await index.upsert([
      {
        id: "test-aven-info", // Unique ID for this piece of info
        values: embedding, // The numbers representing the text
        metadata: {
          // Extra info about this text
          text: testText,
          source: "test",
          type: "company-info",
        },
      },
    ]);

    // 5. Wait a few seconds for Pinecone to index the data
    console.log("⏳ Waiting for Pinecone to index the data...");
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

    // 6. Test if we can find it by searching
    console.log("🔍 Testing search...");

    const search_query =
      "How does Aven determine the credit line size and interest rate?";
    const searchEmbedding = await embeddings.embedQuery(search_query);
    const searchResults = await index.query({
      vector: searchEmbedding,
      topK: 1, // Get 1 best match
      includeMetadata: true, // Include the original text
    });

    // 7. Get the result
    const foundMatch = searchResults.matches?.[0];

    return NextResponse.json({
      success: true,
      message: "Pinecone is working!",
      embedding_size: embedding.length,
      stored_text: testText,
      search_query: search_query,
      found_match: foundMatch
        ? {
            score: foundMatch.score,
            text: foundMatch.metadata?.text,
            id: foundMatch.id,
          }
        : "No match found",
      total_matches: searchResults.matches?.length || 0,
    });
  } catch (error) {
    console.error("❌ Pinecone test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Check if PINECONE_API_KEY and PINECONE_INDEX_NAME are set correctly",
      },
      { status: 500 }
    );
  }
}
