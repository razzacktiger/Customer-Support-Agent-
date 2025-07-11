import VapiWidget from "../components/VapiWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Support Agent</h1>
          <p className="text-lg text-gray-600">Choose between voice chat or text messaging to get help</p>
        </div>
        
        <div className="flex justify-center">
          <VapiWidget
            apiKey={process.env.NEXT_PUBLIC_VAPI_API_KEY!}
            assistantId={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!}
          />
        </div>
        
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How can we help you?</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="text-blue-500">🎤</span>
                <div>
                  <p className="font-medium">Voice Chat</p>
                  <p>Real-time conversation with live transcription</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">💬</span>
                <div>
                  <p className="font-medium">Text Chat</p>
                  <p>Type your questions and get instant responses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
