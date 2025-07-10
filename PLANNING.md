# Aven AI Customer Support Agent - Project Planning

## 📋 Project Overview

Building an intelligent AI Customer Support Agent that knows everything about the startup Aven. Users can interact via text or voice to get accurate, helpful answers about Aven's products, services, and policies.

## 🎯 Project Goals

- **Primary**: Create a knowledgeable AI agent for Aven customer support
- **Secondary**: Demonstrate advanced RAG, voice AI, and safety implementations
- **Bonus**: Include evaluation framework and advanced guardrails

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js Web   │    │   Vapi Voice    │    │  LangChain RAG  │
│      App        │◄──►│     Agent       │◄──►│   + Pinecone    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Text/Voice UI  │    │  Voice Features │    │ Vector Database │
│   Components    │    │  (STT/TTS)      │    │   (Scraped)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend & Backend

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom + shadcn/ui
- **State Management**: React hooks + Context

### AI & Voice

- **Voice Agent**: Vapi.ai
- **Vector Database**: Pinecone
- **RAG Framework**: LangChain
- **Web Scraping**: Exa API
- **LLM**: OpenAI GPT-4o (via LangChain)

### Data & Storage

- **Vector Store**: Pinecone (1536 dimensions)
- **Session Storage**: Redis (optional)
- **File Storage**: Vercel Blob (optional)

### Development Tools

- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/           # Text chat endpoint
│   │   ├── vapi/           # Voice API integration
│   │   ├── scrape/         # Data ingestion
│   │   └── evaluate/       # Evaluation endpoints
│   ├── components/
│   │   ├── chat/           # Chat interface
│   │   ├── voice/          # Voice components
│   │   ├── ui/             # Reusable UI
│   │   └── evaluation/     # Eval dashboard
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── ai/
│   │   ├── rag.ts          # RAG implementation
│   │   ├── embeddings.ts   # Vector operations
│   │   ├── guardrails.ts   # Safety filters
│   │   └── tools.ts        # Function calling
│   ├── integrations/
│   │   ├── exa.ts          # Web scraping
│   │   ├── pinecone.ts     # Vector DB
│   │   ├── vapi.ts         # Voice agent
│   │   └── langchain.ts    # LLM chain
│   ├── utils/
│   │   ├── validation.ts   # Input validation
│   │   ├── formatting.ts   # Response formatting
│   │   └── logger.ts       # Logging utility
│   └── types/
│       ├── chat.ts         # Chat types
│       ├── voice.ts        # Voice types
│       └── aven.ts         # Aven data types
├── data/
│   ├── evaluation/         # Test questions
│   ├── prompts/           # System prompts
│   └── scraped/           # Cached content
└── tests/
    ├── unit/              # Unit tests
    ├── integration/       # API tests
    └── evaluation/        # AI evaluation
```

## 🔒 Environment Variables

```env
# AI Services
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=

# Voice Agent
VAPI_API_KEY=
VAPI_PHONE_NUMBER=

# Web Scraping
EXA_API_KEY=

# Optional
REDIS_URL=
VERCEL_BLOB_READ_WRITE_TOKEN=
```

## 🚀 Development Phases

### Phase 1: Foundation (Core Features)

- Data ingestion and vector storage
- Basic text chat interface
- RAG implementation

### Phase 2: Voice Integration

- Vapi integration
- Voice UI components
- Real-time audio handling

### Phase 3: Advanced Features (Bonuses)

- Evaluation framework
- Guardrails and safety
- Tool calling (meeting scheduling)

### Phase 4: Polish & Deploy

- UI/UX improvements
- Performance optimization
- Production deployment

## 📊 Success Metrics

### Technical

- **Response Time**: < 3 seconds for text, < 5 seconds for voice
- **Accuracy**: > 85% on evaluation set
- **Uptime**: > 99.5%
- **Vector Search**: < 500ms retrieval time

### User Experience

- **Helpfulness Score**: > 4/5 average
- **Citation Quality**: All answers include source links
- **Voice Quality**: Clear, natural speech synthesis
- **Safety**: 0 inappropriate responses

## 🛡️ Safety & Compliance

### Guardrails Implementation

- **Personal Data**: Detect and refuse PII requests
- **Legal/Financial**: Redirect to human agents
- **Toxicity**: Content filtering and response
- **Hallucination**: Confidence scoring and citations

### Data Privacy

- No personal data storage
- Session-based conversations
- GDPR/CCPA compliance considerations

## 🔄 Integration Points

### Aven Website Integration

- Support page content extraction
- FAQ processing
- Product documentation ingestion
- Policy and terms parsing

### External APIs

- **Exa**: Web scraping and content discovery
- **Vapi**: Voice conversation management
- **Pinecone**: Vector similarity search
- **OpenAI**: Text generation and embeddings

## 📈 Future Enhancements

- Multi-language support
- Advanced analytics dashboard
- A/B testing framework
- Mobile app integration
- WhatsApp/Slack bot versions
- Advanced tool integrations (CRM, Calendar)

## 🧪 Testing Strategy

### Unit Tests

- Component rendering
- Utility functions
- API endpoint logic

### Integration Tests

- RAG pipeline end-to-end
- Voice agent workflows
- Database operations

### AI Evaluation

- Automated accuracy scoring
- Human evaluation sessions
- Continuous monitoring

---

_Last Updated: December 2024_
_Next Review: January 2025_
