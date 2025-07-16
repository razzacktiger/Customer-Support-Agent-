# Customer Support Agent 🤖

An AI-powered customer support application with voice and text chat capabilities, built with Next.js and TypeScript.

## 🌟 Features

- **🎤 Voice Chat**: Real-time voice conversations with AI assistant using Vapi
- **💬 Text Chat**: Traditional text-based messaging with OpenAI and Google Gemini integration
- **🔄 Dual Interface**: Seamless switching between voice and text modes
- **📝 Live Transcription**: Real-time speech-to-text with automatic corrections
- **🔒 Secure API Management**: Server-side API key handling for security
- - **🔎 Context-Aware Answers**: Uses Pinecone vector search and Gemini embeddings for more relevant responses
- **📱 Responsive Design**: Modern UI that works on desktop and mobile
- **⚡ Real-time Updates**: Live conversation history and status indicators

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- API keys for the services you want to use (OpenAI, Google Gemini, Pinecone, etc.)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Customer-Support-Agent.git
cd Customer-Support-Agent
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Environment Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Client-side API Keys (Vapi requires client-side access)
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here

# Server-side only API Keys (secure)
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
EXA_API_KEY=your_exa_api_key_here
GOOGLE_API_KEY=your_google_generative_ai_key_here
```

### 4. Get Your API Keys

#### Vapi (Voice Chat)
1. Visit [Vapi.ai](https://vapi.ai)
2. Create an account and get your API key
3. Create an assistant and note the Assistant ID

#### OpenAI (Text Chat)
1. Visit [OpenAI](https://platform.openai.com)
2. Create an account and generate an API key
3. Ensure you have credits for API usage

#### Google Generative AI (Gemini)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key for Gemini
3. Add it to your `.env` as `GOOGLE_API_KEY`

#### Pinecone (Vector Search)
1. Visit [Pinecone](https://pinecone.io)
2. Create an account and get your API key
3. Add it to your `.env` as `PINECONE_API_KEY`

#### Optional: Exa
- [Exa](https://exa.ai) - Web search capabilities

### 5. Run the Application

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/              # Text chat endpoint
│   │   ├── config/            # Secure configuration endpoint
│   │   └── vapi-proxy/        # Vapi integration
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── components/
│   └── VapiWidget.tsx         # Main chat component
└── config/
    └── security.ts            # Environment & security utilities
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_VAPI_API_KEY` | Yes | Vapi API key for voice chat |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | Yes | Vapi assistant ID |
| `OPENAI_API_KEY` | Yes | OpenAI API key for text chat |
| `PINECONE_API_KEY` | No | Pinecone vector database key |
| `EXA_API_KEY` | No | Exa search API key |
| `GOOGLE_API_KEY` | Yes | Google Generative AI (Gemini) API key |

### Security Notes

- ⚠️ **Client-side keys**: Only Vapi keys are exposed to the client (required for voice functionality)
- 🔒 **Server-side keys**: OpenAI and other sensitive keys remain server-side only
- 🛡️ **Domain restrictions**: Configure domain restrictions in your Vapi dashboard
- 📊 **Usage monitoring**: Set up usage limits and monitoring for all APIs

## 🎯 Usage

### Voice Chat
1. Click the "Voice Chat" tab
2. Grant microphone permissions when prompted
3. Click "Start Voice Chat" to begin conversation
4. Speak naturally - transcription appears in real-time
5. Click "End Call" to stop the conversation

### Text Chat
1. Click the "Text Chat" tab
2. Type your message in the input field
3. Press Enter or click Send to submit
4. View AI responses in real-time

### Features
- **Message History**: Separate conversation histories for voice and text
- **Auto-correction**: Common transcription errors are automatically fixed
- **Status Indicators**: Visual feedback for connection and speaking states
- **Responsive Design**: Works seamlessly on all devices
- **Context-Aware Answers**: Uses Pinecone and Gemini to provide answers based on your own data and context

## 🧠 Gemini & Pinecone Integration

This project uses Google Generative AI (Gemini) for advanced embeddings and Pinecone for vector search. This enables context-aware answers based on your own data.

**How it works:**
- User messages are embedded using Gemini
- Embeddings are used to query Pinecone for relevant context
- The context is included in the prompt to Gemini for a more accurate answer

**Environment variables required:**
- `GOOGLE_API_KEY` (Gemini)
- `PINECONE_API_KEY` (Pinecone)

See the `/src/app/api/chat/completions/route.ts` for implementation details.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy with one click

### Manual Deployment

```bash
npm run build
npm start
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create a new feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Create a pull request

## 🔍 Troubleshooting

### Common Issues

**Voice chat not working:**
- Check microphone permissions
- Ensure Vapi API key is valid
- Try refreshing the page

**Text chat errors:**
- Verify OpenAI API key is correct
- Check API usage limits
- Review console for error messages

**Environment variables not loading:**
- Restart the development server
- Check `.env` file syntax
- Ensure no trailing spaces in variable values

## 📚 API Documentation

### Chat API (`/api/chat`)
```typescript
POST /api/chat
Content-Type: application/json

{
  "message": "Your message here"
}
```

### Config API (`/api/config`)
```typescript
GET /api/config

Response: {
  "vapiApiKey": "...",
  "vapiAssistantId": "..."
}
```

## 👥 Meet the Developers

- **[Rayan Roshan](https://www.linkedin.com/in/rayan-roshan/)**
- **[Haroon Razzack](https://www.linkedin.com/in/haroonrazzack/)**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vapi.ai](https://vapi.ai) for voice AI capabilities
- [OpenAI](https://openai.com) for text generation
- [Next.js](https://nextjs.org) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Vercel](https://vercel.com) for hosting platform

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/razzacktiger/Customer-Support-Agent-/issues) page
2. Create a new issue if your problem isn't listed
3. Provide detailed information about your setup and the issue

---

<div align="center">
  <strong>Built with ❤️ using Next.js and AI</strong>
</div>
