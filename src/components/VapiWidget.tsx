"use client";
import React, { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { Logger } from "@/utils/logger";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  type: "text" | "voice";
}

interface VapiWidgetProps {
  apiKey: string;
  assistantId: string;
}

const logger = new Logger("VapiWidget");

const VapiWidget: React.FC<VapiWidgetProps> = ({ apiKey, assistantId }) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMessages, setVoiceMessages] = useState<Message[]>([]);
  const [textMessages, setTextMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [transcription, setTranscription] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [activeTab, setActiveTab] = useState<"voice" | "text">("voice");
  const [audioSupported, setAudioSupported] = useState(true);
  const [vapiError, setVapiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check audio support
  const checkAudioSupport = () => {
    try {
      const hasMediaDevices = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );
      const hasAudioContext = !!(
        window.AudioContext || (window as any).webkitAudioContext
      );
      return hasMediaDevices && hasAudioContext;
    } catch (error) {
      console.warn("Audio support check failed:", error);
      return false;
    }
  };

  // Text correction function for common transcription errors
  const correctTranscription = (text: string): string => {
    const corrections: { [key: string]: string } = {
      Avon: "Aven",
      avon: "Aven",
      AVON: "Aven",
      // Add more common corrections as needed
      "there.": "there",
      "support.": "support",
    };

    let correctedText = text;

    // Apply word-level corrections
    Object.entries(corrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, "gi");
      correctedText = correctedText.replace(regex, correct);
    });

    return correctedText;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [voiceMessages, textMessages]);

  useEffect(() => {
    // Check audio support on component mount
    setAudioSupported(checkAudioSupport());

    // Filter out audio processor warnings and transport errors
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    console.warn = (...args) => {
      const message = args.join(" ");
      if (
        !message.includes("audio processor") &&
        !message.includes("Ignoring settings for browser") &&
        !message.includes("platform-unsupported input processor") &&
        !message.includes("recv transport changed")
      ) {
        originalConsoleWarn.apply(console, args);
      }
    };

    console.error = (...args) => {
      const message = args.join(" ");
      if (
        !message.includes("recv transport changed") &&
        !message.includes("transport changed to disconnected")
      ) {
        originalConsoleError.apply(console, args);
      }
    };

    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => {
      setIsConnected(true);
    });

    vapiInstance.on("call-end", () => {
      setIsConnected(false);
      setIsSpeaking(false);
      setTranscription("");
      setAssistantResponse("");
    });

    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false);
    });

    // Enhanced transcription handling
    vapiInstance.on("message", (message: any) => {
      if (message.type === "transcript" && message.role === "user") {
        if (message.transcript) {
          const correctedText = correctTranscription(message.transcript);
          const userMessage: Message = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: correctedText,
            sender: "user",
            timestamp: new Date(),
            type: "voice",
          };
          setVoiceMessages(prev => [...prev, userMessage]);
          // Let VAPI handle the response via custom LLM endpoint
        }
      } else if (
        message.type === "transcript" &&
        message.role === "assistant"
      ) {
        if (message.transcript) {
          const correctedText = correctTranscription(message.transcript);
          const assistantMessage: Message = {
            id: `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: correctedText,
            sender: "assistant",
            timestamp: new Date(),
            type: "voice",
          };
          setVoiceMessages(prev => [...prev, assistantMessage]);
        }
      }
    });

    vapiInstance.on("error", error => {
      console.error("Vapi error:", error);
      // Filter out audio processor warnings which are harmless
      if (
        !error.message?.includes("audio processor") &&
        !error.message?.includes("Ignoring settings")
      ) {
        setVapiError(
          "Voice assistant is currently unavailable. Please use text chat below."
        );
      }
    });

    return () => {
      vapiInstance?.stop();
      // Restore original console methods
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, [apiKey]);

  const startCall = async () => {
    if (!vapi) return;

    try {
      // Request microphone permission first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      vapi.start(assistantId);
    } catch (error) {
      console.error("Failed to start voice chat:", error);
      setVapiError(
        "Voice assistant is currently unavailable. Please use text chat below."
      );
      // Add user message about the error
      const errorMessage: Message = {
        id: `error_voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: "Failed to start voice chat. Please check microphone permissions and try again.",
        sender: "assistant",
        timestamp: new Date(),
        type: "voice",
      };
      setVoiceMessages(prev => [...prev, errorMessage]);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  const sendTextMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: `text_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: currentMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    setTextMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");

    // Simulate assistant response (replace with actual API call)
    try {
      const response = await fetch("/api/chat/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentMessage }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `text_assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text:
          data.response ||
          "I apologize, but I encountered an error processing your message.",
        sender: "assistant",
        timestamp: new Date(),
        type: "text",
      };

      setTextMessages(prev => {
        if (
          prev.some(
            msg =>
              msg.text === assistantMessage.text && msg.sender === "assistant"
          )
        ) {
          return prev; // Don't add duplicate
        }
        return [...prev, assistantMessage];
      });
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `error_text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
        type: "text",
      };
      setTextMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  const clearCurrentConversation = () => {
    if (activeTab === "voice") {
      setVoiceMessages([]);
    } else {
      setTextMessages([]);
    }
  };

  // Note: Removed sendVoiceMessageToBackend to prevent double processing
  // VAPI now handles responses directly via custom LLM endpoint

  return (
    <div className="flex flex-col h-[500px] max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Fallback error message for Vapi */}
      {vapiError && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 m-4 text-center">
          <div className="font-semibold mb-1">{vapiError}</div>
          <div className="text-sm">
            You can continue the conversation using text chat below.
          </div>
        </div>
      )}
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("voice")}
          className={`flex-1 py-3 px-4 text-sm font-medium relative ${
            activeTab === "voice"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>🎤 Voice Chat</span>
            {voiceMessages.length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                {voiceMessages.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab("text")}
          className={`flex-1 py-3 px-4 text-sm font-medium relative ${
            activeTab === "text"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>💬 Text Chat</span>
            {textMessages.length > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                {textMessages.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Header with conversation info and clear button */}
        {(() => {
          const currentMessages =
            activeTab === "voice" ? voiceMessages : textMessages;
          const conversationType =
            activeTab === "voice" ? "Voice Conversation" : "Text Conversation";

          return (
            <>
              {currentMessages.length > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-4">
                  <div className="text-sm font-medium text-gray-600">
                    {conversationType} ({currentMessages.length} messages)
                  </div>
                  <button
                    onClick={clearCurrentConversation}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                  >
                    Clear
                  </button>
                </div>
              )}

              {currentMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="mb-2 text-2xl">
                    {activeTab === "voice" ? "🎤" : "💬"}
                  </div>
                  <p className="font-medium mb-1">
                    {activeTab === "voice" ? "Voice Chat" : "Text Chat"}
                  </p>
                  <p className="text-sm">
                    {activeTab === "voice"
                      ? "Start a voice conversation with real-time transcription!"
                      : "Send a text message to get started!"}
                  </p>
                </div>
              ) : (
                currentMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-xs opacity-75">
                          {message.type === "voice" ? "🎤" : "💬"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          );
        })()}

        {/* Live transcription display - only show in voice tab */}
        {activeTab === "voice" && transcription && (
          <div className="flex justify-end">
            <div className="max-w-xs px-3 py-2 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
              <p className="text-sm italic">{transcription}</p>
              <span className="text-xs">Transcribing...</span>
            </div>
          </div>
        )}

        {/* Assistant thinking indicator - only show in text tab */}
        {activeTab === "text" && assistantResponse && (
          <div className="flex justify-start">
            <div className="max-w-xs px-3 py-2 rounded-lg bg-gray-100 text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Chat Controls */}
      {activeTab === "voice" && (
        <div className="p-4 border-t border-gray-200">
          {!audioSupported && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-800">
                <span>⚠️</span>
                <span className="text-sm">
                  Audio may not be fully supported in this browser. Some
                  features might be limited.
                </span>
              </div>
            </div>
          )}

          {!isConnected ? (
            <button
              onClick={startCall}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              <span>🎤</span>
              <span>Start Voice Chat</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div
                  className={`w-3 h-3 rounded-full ${isSpeaking ? "bg-red-500 animate-pulse" : "bg-green-500"}`}
                ></div>
                <span className="text-gray-700">
                  {isSpeaking ? "Assistant Speaking..." : "Listening..."}
                </span>
              </div>
              <button
                onClick={endCall}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                End Call
              </button>
            </div>
          )}
        </div>
      )}

      {/* Text Chat Input */}
      {activeTab === "text" && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
            <button
              onClick={sendTextMessage}
              disabled={!currentMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VapiWidget;
