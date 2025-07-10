"use client";
import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

interface VapiWidgetProps {
  apiKey: string;
  assistantId: string;
}

const VapiWidget: React.FC<VapiWidgetProps> = ({ apiKey, assistantId }) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => {
      setIsConnected(true);
    });
    vapiInstance.on('call-end', () => {
      setIsConnected(false);
      setIsSpeaking(false);
    });
    vapiInstance.on('speech-start', () => {
      setIsSpeaking(true);
    });
    vapiInstance.on('speech-end', () => {
      setIsSpeaking(false);
    });
    vapiInstance.on('error', (error) => {
      console.error('Vapi error:', error);
    });
    return () => {
      vapiInstance?.stop();
    };
  }, [apiKey]);

  const startCall = () => {
    if (vapi) {
      vapi.start(assistantId);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif',
      background: 'rgba(0,0,0,0.05)'
    }}>
      {!isConnected ? (
        <button
          onClick={startCall}
          style={{
            background: '#12A594',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            padding: '20px 32px',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(18, 165, 148, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(18, 165, 148, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(18, 165, 148, 0.3)';
          }}
        >
          🎤 Talk to Assistant
        </button>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: '18px',
          padding: '28px',
          width: '320px',
          boxShadow: '0 10px 32px rgba(0, 0, 0, 0.14)',
          border: '1px solid #e1e5e9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: isSpeaking ? '#ff4444' : '#12A594',
              animation: isSpeaking ? 'pulse 1s infinite' : 'none'
            }}></div>
            <span style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>
              {isSpeaking ? 'Assistant Speaking...' : 'Listening...'}
            </span>
          </div>
          <button
            onClick={endCall}
            style={{
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 16px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            End Call
          </button>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VapiWidget; 