// Script to ingest Aven support content into RAG
// Run with: node src/data/ingest-aven-support.js

const avenSupportContent = {
  content: `
  Title: Support | Aven Card
  URL: https://www.aven.com/support/
  
  SUPPORT - How can we help?

  TRENDING ARTICLES:

  Q: Is the rate variable?
  A: The Aven Card is a variable rate credit card. Cash outs may have a fixed rate option. See your offer for details. The variable rate varies based on an Index (Prime Rate published in the Wall Street Journal or the Federal Funds Target Rate Upper Limit set by the Federal Reserve). This is outside Aven's control. As the Index shifts up or down, so will the APR on the Aven Card and any other variable-rate credit cards, lines, and loans. The Index may change several times a year or go for many months without change.

  Q: How does Aven determine the credit line size and interest rate?
  A: Aven's bank-standard underwriting system is fully automated, and calculates offers based on an applicant's income, equity, credit, and debt obligations.

  Q: Does Aven offer a fixed rate?
  A: Some Aven cardholders may be able to create fixed payment, fixed rate Simple Loan plans. Applicants can check their details in their account agreement.

  Q: Is Aven a credit card or a home equity line of credit?
  A: It is both! Aven is a home equity line of credit that customers access through a credit card. Aven cardholders can use their Aven Card wherever VISA cards are accepted.

  Aven cardholders can transfer cash directly from their Aven account to another bank account – it is called a CashOut. There may be a one time fee (please see your account agreement) of the total amount being transferred that will be added to the balance.

  To transfer balance from a high interest credit card to the Aven card, cardholders can request a balance transfer (BT) to their credit card. There may be a one time fee (please see your account agreement) of the total amount being transferred that will be added to the balance.

  PAYMENTS:

  Q: How are payments calculated for fixed installment plans?
  A: Aven offers fixed payment plans that amortize over several years, details being in the account agreement. The payment is calculated so that the entire amount of the plan and the interest is paid off by the end of the selected term. For payment estimates, please visit https://www.aven.com/paymentcalculator

  Q: How do you compute my minimum due every month?
  A: For revolving balance plans, the minimum monthly payment is 1% of the principal plus the monthly interest rate on the outstanding balance. For fixed monthly payment plans, the monthly payment amount is the same every month. If an account has multiple plans, each plan's minimum payment is added to calculate the total minimum payment due for the entire account. For payment estimates, please visit https://aven.com/paymentCalculator.

  Q: Is there a prepayment penalty?
  A: There is no a prepayment penalty on an Aven Card account. Cardholders can pay more than the minimum due each month, make extra lump-sum payments, or make a full payoff payment. Cardholders can also find more details about their Account Agreement, here https://my.aven.com/card/accountDetails

  Important Note: If a Cardholder intends to payoff an account, the funds must be sent through wire transfer. If any other method of funding is used, there will be a 60 day wait period before the lien is released. Aven is unable to waive or shorten this wait period.

  Q: How is interest calculated on the Aven account?
  A: Interest calculation on the Aven card depends on the type of balance (purchase, balance transfer, cash out, fixed payment plan balance, etc) on an account. Most accounts have several balance types, so the total interest is the sum of the interest calculated on each balance type.

  For purchases, interest accrues daily at the daily interest rate (APR divided by 365). This interest is waived for new purchases if the entire purchase balance is paid in full by the due date shown on the next statement. If the purchase balance is not paid in full, in the next cycle, there will be interest for 2 cycles on the purchase, starting from the date of the purchase.

  For Balance Transfers and Cash-outs that are revolving plans, interest accrues daily at the daily interest rate (APR divided by 365), starting when the Cash-Out or Balance Transfer is disbursed.

  Any balances in a fixed monthly payment plan either have interest accrued daily at the daily interest rate of the plan (Plan APR divided by 365) or have a fixed monthly fee in place of interest. These charges are disclosed at the time of plan creation.

  In addition to interest, the monthly payment also includes repayment of a portion of the principal balance. For Purchases, Balance Transfers, and Cash Outs on revolving plans, 1% of the outstanding balance is the principal portion of the minimum due. For fixed monthly payment plans, the part of the fixed payment that is not interest or monthly fee is allocated to the principal.

  If an account has zero balance in any cycle, there will be no payment due for that cycle.

  Q: When is the monthly payment due?
  A: Statements are generated each month close to the monthly anniversary of when cardholders signed up for an Aven account. Payment due dates are highlighted in the statement as well as in the Aven Card app. Statements are available on the Aven app and online: https://my.aven.com/statements

  Q: How can I make a payment on my monthly statement?
  A: Aven cardholders can pay their Aven bill using the Aven Card app. Please note that Aven does not accept checks or cash by mail. https://my.aven.com/

  Q: Do missed payments impact a customer's home?
  A: One or two late payments will not put a cardholders home at risk or in default. Aven offers multiple hardship services to cardholders who struggle with their payments. Please note that an account may be blocked if no payment is received by the time the next statement is issued.

  Q: Can I pay with a check?
  A: Aven cardholders can use the Aven Card app to easily connect their bank account using their routing and account number to make a payment. They can also use their existing online banking platforms to make payments to Aven. https://my.aven.com/

  Q: Can I add or remove bank accounts for Auto pay or bill pay?
  A: Cardholders can add or remove bank accounts in the Aven Card app or online at https://my.aven.com/card

  Q: Does a purchase refund count against the minimum payment due?
  A: While a refunded purchase will reduce a customer's remaining statement balance, it will not count towards the minimum due payment - with one exception: if there is only one purchase during the cycle, and this purchase is refunded to bring the statement balance to zero, there will be no minimum payment for that cycle.

  BEFORE YOU APPLY:

  Q: What are the eligibility criteria for applying for Aven?
  A: Aven's bank-standard underwriting system is fully automated and generates an offer based on an applicant's income, equity, credit, and debt obligations. Meeting the minimum criteria does not guarantee an approval. All signers (applicants and/or co-owners) must be at least 18 years of age or older. All signers must possess valid government issued identification documents specified by Aven. For lines above $100,000, borrowers need to provide proof of insurance and proof of adding Aven/Coastal Community Bank as a beneficiary on the policy.

  Q: How do you verify income?
  A: Aven can verify income by securely connecting an applicant's bank account, or reviewing uploaded documents including Form 1040, a pay stub, W2, 1099-R, 1099-SSA, 1099-B, retirement income, benefit income. Aven's online application will specify the types of documents to upload.

  Q: Will applying affect or impact my credit score?
  A: When you apply for an Aven card, we perform a "soft pull" on your credit in order to determine an offer. This does NOT impact the applicant's credit score. You can check your offer without your credit score being affected. Only after you accept an offer and schedule a time with our notaries will we make a hard inquiry on your credit profile. This may impact the credit score.

  Q: What if I am self-employed?
  A: Aven accepts self-employed applicants. For further information regarding income verification, click here: https://www.aven.com/support/article/4407100363405.

  Q: What is HMDA?
  A: Section 1003.4(a)(10) of the Home Mortgage Disclosure Act requires all mortgage lenders to collect various consumer data, including information about an applicant's ethnicity, race, sex, and age. We state this requirement at the top of the page in which the information is collected. This protected information in no way impacts an applicant's offer, as required by the Equal Credit Opportunity Act and Fair Housing Act. In fact, applicants have the opportunity to refuse disclosure of this information, as you did, nullifying any opportunity for discrimination.

  Q: Can I pay off an existing HELOC with the Aven Card?
  A: Aven offers a HELOC refinance product for qualified applicants.

  Q: What credit score or FICO score do you use?
  A: Aven uses FICO V9 and VantageScore 4.0 from Experian, a top credit reporting agency.

  Q: Why do I have to wait the 3 business cancellation or rescission period?
  A: Consumer protection regulations require that applicants be given three business days to cancel the account because of the security interest in the home. You cannot use the card until the cancellation period (also known as a rescission period) has expired. This regulation was established by the Truth in Lending Act (TILA) under U.S. federal law, and allows a borrower to cancel a home equity loan, line of credit, or refinance with a new lender, within three days of closing.

  Q: Can I apply or be eligible if my home is in a flood hazard zone?
  A: Yes, Aven does support properties in flood zones. Applicants will be required to submit proof of active flood insurance during the application process. If the property is a condo, applicants may be requested to upload proof of the condo buildings flood insurance policy along with the applicant's individual Homeowner's Insurance Policy. Once approved for an Aven Card, Cardholders are required to send a copy of the flood (and HOI for Condos) once it renews. A reminder notice will be sent 45 days and 15 days prior to the insurance expiration.

  Q: Are you a bank or FDIC insured? Who provides the credit?
  A: We are partnered with Coastal Community Bank, which is FDIC insured.
  `,
  metadata: {
    id: "aven-support-comprehensive",
    source: "aven-website",
    type: "support-faq",
    title: "Aven Support - Comprehensive FAQ",
    url: "https://www.aven.com/support/",
    publishedDate: "2025-02-01T03:20:00.000Z",
  },
};

async function ingestAvenSupport() {
  try {
    console.log("🚀 Ingesting Aven support content...");

    const response = await fetch("http://localhost:3000/api/ingest-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documents: [avenSupportContent],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Aven support content ingested successfully!");
    console.log("Result:", result);
  } catch (error) {
    console.error("❌ Failed to ingest Aven support content:", error);
  }
}

// Run the ingestion
ingestAvenSupport();
