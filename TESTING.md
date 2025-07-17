# 🧪 Testing Guide - Aven Customer Support Agent

This guide walks you through testing your complete pipeline: **Firecrawl → Gemini → Pinecone → Chat → Voice**.

## 📋 Prerequisites

Before testing, ensure you have:

1. **Environment Variables Set** (in `.env.local`):

   ```bash
   FIRECRAWL_API_KEY=fc-xxx
   GOOGLE_API_KEY=xxx
   PINECONE_API_KEY=xxx
   PINECONE_INDEX_NAME=aven-support
   OPENAI_API_KEY=xxx
   VAPI_API_KEY=xxx
   VAPI_ASSISTANT_ID=xxx
   ```

2. **Dependencies Installed**:

   ```bash
   npm install
   ```

3. **Pinecone Index Created** with:
   - Dimension: `1536`
   - Metric: `cosine`
   - Cloud: `aws`

## 🚀 Testing Methods

### Method 1: Automated Test Suite (Recommended)

Run the comprehensive test suite that checks everything:

```bash
# 1. Start your Next.js development server
npm run dev

# 2. In a new terminal, run the complete test suite
npx tsx src/app/scripts/test-complete-pipeline.ts
```

This will test:

- ✅ Environment variables
- ✅ Firecrawl scraping
- ✅ Gemini embeddings
- ✅ Pinecone connection
- ✅ Chat API functionality
- ✅ Config API for Vapi
- ✅ Search accuracy across multiple queries

**Expected Result**: All tests should pass with a success rate of 100%.

---

### Method 2: Manual Step-by-Step Testing

#### Step 1: Test Data Pipeline

```bash
# Run the complete pipeline (scraping → embedding → storage)
npx tsx src/app/scripts/simple-pipeline.ts
```

**Expected Output**:

```
✅ Scraped 4 pages with Firecrawl API
✅ Embedded 70 chunks using gemini-embedding-001
✅ Stored all vectors in Pinecone
✅ Pipeline completed in ~37s
```

#### Step 2: Test Individual Components

**Test Pinecone Connection:**

```bash
curl http://localhost:3001/api/test-pinecone
```

**Test Chat API:**

```bash
curl -X POST http://localhost:3001/api/chat/text \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Aven?"}'
```

**Test Config API:**

```bash
curl http://localhost:3001/api/config
```

#### Step 3: Test UI

1. Open `http://localhost:3001`
2. Verify the page loads without errors
3. Test the VapiWidget for voice functionality

---

### Method 3: Utility Scripts

#### Check Pinecone Indexes and Data

```bash
npx tsx src/app/scripts/check-pinecone-indexes.ts
```

#### Run the Complete Pipeline

```bash
npx tsx src/app/scripts/simple-pipeline.ts
```

---

## 🔍 What Each Test Validates

### Pipeline Tests

- **Scraping**: Firecrawl API returns valid markdown content
- **Embeddings**: Gemini creates 1536-dimension vectors
- **Storage**: Vectors stored successfully in Pinecone
- **Search**: Retrieval returns relevant results with high similarity scores

### API Tests

- **Chat**: Returns contextual responses using RAG
- **Config**: Provides Vapi credentials for voice integration
- **Test Routes**: Individual component functionality

### Performance Tests

- **Response Time**: < 3 seconds for chat responses
- **Search Quality**: Similarity scores > 0.5 for relevant queries
- **Knowledge Usage**: RAG system finds and uses stored knowledge

---

## 📊 Success Criteria

### ✅ Tests Passing When:

1. **Pipeline**: Completes without errors, stores 70+ vectors
2. **Chat API**: Returns relevant answers with knowledge usage
3. **Search**: Finds appropriate content with scores > 0.5
4. **Voice**: VapiWidget loads and config API responds
5. **Performance**: All operations complete within expected timeframes

### ❌ Common Issues & Solutions:

**"Environment Variables Missing"**

```bash
# Copy example and fill in your keys
cp .env.example .env.local
```

**"Pinecone Index Not Found"**

- Create index in Pinecone console with dimension 1536

**"Gemini API Error"**

- Verify `GOOGLE_API_KEY` is valid
- Check you're using the latest `@google/genai` package

**"No Knowledge Found"**

- Run the pipeline first: `npx tsx src/app/scripts/simple-pipeline.ts`
- Verify vectors were stored in Pinecone

**"Chat API 500 Error"**

- Check Next.js dev server is running on port 3000
- Verify all environment variables are loaded

---

## 🧪 Advanced Testing

### Load Testing

```bash
# Test multiple concurrent chat requests
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/chat/text \
    -H "Content-Type: application/json" \
    -d '{"message": "What services does Aven provide?"}' &
done
wait
```

### Accuracy Testing

Create a test file with known questions and expected answers:

```bash
# Create test questions
echo '["What is Aven?", "How do I contact support?", "What are the fees?"]' > test-questions.json

# Test each question (manual validation required)
```

### Voice Integration Testing

1. Open `http://localhost:3001`
2. Click the voice widget
3. Test voice conversation with questions like:
   - "What is Aven?"
   - "How do I apply for a credit card?"
   - "What are your customer support hours?"

---

## 📈 Monitoring & Metrics

Track these metrics during testing:

- **Response Time**: Average time for chat responses
- **Knowledge Usage Rate**: % of responses using stored knowledge
- **Search Relevance**: Average similarity scores
- **Error Rate**: Failed API calls / total calls
- **Vector Count**: Number of chunks stored in Pinecone

---

## 🎯 Next Steps After Testing

Once all tests pass:

1. **Deploy to Production** (Vercel)
2. **Set up Monitoring** (error tracking, analytics)
3. **Create User Acceptance Tests**
4. **Plan Performance Optimizations**
5. **Add More Aven Content** (expand knowledge base)

---

## 🆘 Need Help?

If tests fail or you encounter issues:

1. Check the **console logs** for detailed error messages
2. Verify **environment variables** are set correctly
3. Ensure **dependencies** are installed and up to date
4. Review the **error messages** in the test output
5. Check **API quotas** (Firecrawl, Google, Pinecone, OpenAI)

Remember: The goal is a fully functional **Firecrawl → Gemini → Pinecone → Chat → Voice** pipeline! 🚀
