// Example script for ingesting data into the RAG system
// Run this with: node src/data/example-data-ingestion.js

const exampleDocuments = [
  {
    content: `
    Aven Card Overview:
    The Aven Card is a revolutionary credit card that combines the security of home equity with the convenience of traditional credit cards. Here are key features:

    1. Home Equity Backed: Unlike traditional credit cards, the Aven Card is backed by your home equity, providing access to larger credit lines at lower interest rates.

    2. Variable APR: The card features a variable interest rate that changes with market conditions. This rate is typically lower than traditional credit cards because it's secured by your home.

    3. Credit Line: Your credit line is determined by your home equity, income, and creditworthiness. Many customers receive credit lines significantly higher than traditional cards.

    4. VISA Acceptance: The Aven Card is accepted anywhere VISA is accepted, providing the same convenience as any major credit card.

    5. No Annual Fee: There are no annual fees associated with the Aven Card, making it cost-effective for regular use.
    `,
    metadata: {
      id: "aven-card-overview",
      source: "product-documentation",
      type: "product-info",
      title: "Aven Card Overview",
      url: "https://aven.com/card",
    },
  },
  {
    content: `
    Aven Application Process:
    Applying for an Aven Card is straightforward and designed to be completed entirely online:

    1. Pre-qualification: Check your potential offer without impacting your credit score. This gives you an estimate of your credit line and interest rate.

    2. Property Verification: We'll verify your home ownership and current property value using public records and automated valuation models.

    3. Income Verification: Provide documentation of your income through pay stubs, tax returns, or bank statements.

    4. Credit Check: A hard credit inquiry will be performed as part of the final approval process.

    5. Home Equity Assessment: We'll calculate your available home equity and determine your credit line based on this assessment.

    6. Final Approval: Once approved, you'll receive your card within 7-10 business days.

    The entire process typically takes 2-5 business days from application to approval.
    `,
    metadata: {
      id: "application-process",
      source: "help-documentation",
      type: "process-info",
      title: "Application Process",
      url: "https://aven.com/apply",
    },
  },
  {
    content: `
    Aven Security Features:
    Security is paramount with the Aven Card. Here are our key security features:

    1. Bank-Level Security: All transactions and data are protected with bank-level encryption and security protocols.

    2. Fraud Monitoring: Real-time fraud monitoring alerts you to suspicious activity immediately.

    3. Mobile App Security: Our mobile app uses biometric authentication and device recognition for added security.

    4. Home Equity Protection: Since the card is backed by home equity, there are additional protections in place to prevent over-borrowing.

    5. Customer Support: 24/7 customer support is available for any security concerns or questions.

    6. Zero Liability: You're protected from unauthorized purchases with our zero liability policy.
    `,
    metadata: {
      id: "security-features",
      source: "security-documentation",
      type: "security-info",
      title: "Security Features",
      url: "https://aven.com/security",
    },
  },
  {
    content: `
    Aven Interest Rates and Terms:
    Understanding your Aven Card's interest rates and terms:

    1. Variable APR: The Annual Percentage Rate (APR) is variable and tied to the Prime Rate. This means your rate can change as market conditions change.

    2. Introductory Rates: New customers may be eligible for introductory rates for a limited time period.

    3. Payment Terms: Minimum payments are calculated based on your balance and current interest rate. You can pay more than the minimum to reduce interest charges.

    4. Grace Period: There's a grace period for new purchases if you pay your full balance by the due date.

    5. Late Fees: Late payment fees apply if payments are not received by the due date.

    6. Fixed Rate Options: Some customers may have access to fixed-rate payment plans for specific purchases.
    `,
    metadata: {
      id: "rates-and-terms",
      source: "financial-documentation",
      type: "financial-info",
      title: "Interest Rates and Terms",
      url: "https://aven.com/rates",
    },
  },
];

async function ingestData() {
  try {
    console.log("🚀 Starting data ingestion...");

    const response = await fetch("http://localhost:3000/api/ingest-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documents: exampleDocuments,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Data ingestion successful!");
    console.log("Result:", result);
  } catch (error) {
    console.error("❌ Data ingestion failed:", error);
  }
}

// Run the ingestion
ingestData();
