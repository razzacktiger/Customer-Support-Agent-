"use client";
import { useState, useEffect } from 'react';
import VapiWidget from "../components/VapiWidget";

interface Config {
  vapiApiKey: string;
  vapiAssistantId: string;
}

export default function Home() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error('Failed to load configuration');
        }
        const configData = await response.json();
        setConfig(configData);
      } catch (err) {
        console.error('Error loading config:', err);
        setError('Failed to load application configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Service Unavailable</h2>
          <p className="text-gray-600">{error || 'Unable to load the application'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Support Agent</h1>
          <p className="text-lg text-gray-600">Choose between voice chat or text messaging to get help</p>
        </div>
        
        <div className="flex justify-center">
          <VapiWidget
            apiKey={config.vapiApiKey}
            assistantId={config.vapiAssistantId}
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
