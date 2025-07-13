import VapiWidget from "../components/VapiWidget";

export default function Home() {
  // Note: We should NOT pass API keys to client components
  // Instead, the VapiWidget should use the /api/vapi-proxy endpoint
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Customer Support Agent</h1>
        <VapiWidget />
      </div>
    </div>
  );
}
