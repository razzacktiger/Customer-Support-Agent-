import VapiWidget from "../components/VapiWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Customer Support Agent</h1>
        <VapiWidget
          apiKey={process.env.NEXT_PUBLIC_VAPI_API_KEY!}
          assistantId={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!}
        />
      </div>
    </div>
  );
}
