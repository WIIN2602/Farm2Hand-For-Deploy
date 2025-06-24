import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { RecommendedQuestions } from '../components/RecommendedQuestions';
import { sendMessage } from '../services/openai';
import { formatChatText } from '../utils/textUtils';
import { useAuth } from '../contexts/AuthContext';
import type { Message } from '../types/chat';

export const ChatbotPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [showRecommendedQuestions, setShowRecommendedQuestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when component mounts
  useEffect(() => {
    if (!hasShownWelcome && !import.meta.env.VITE_OPENAI_API_KEY) {
      // Don't show welcome message if API key is missing
      return;
    }

    if (!hasShownWelcome) {
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now().toString(),
        role: 'assistant',
        content: isAuthenticated 
          ? `สวัสดีคุณ${user?.name} ยินดีต้อนรับสู่ Farm2Hand AI Assistant\nต้องการให้ช่วยหาสินค้าหรือให้คำแนะนำอะไรดีครับ?`
          : 'ยินดีต้อนรับสู่Chatbot AI ของ Farm2Hand ครับ\nต้องการให้ช่วยอะไรดีครับ?',
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
      setHasShownWelcome(true);
      setShowRecommendedQuestions(true);
    }
  }, [hasShownWelcome, isAuthenticated, user?.name]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Hide recommended questions when user starts typing
    setShowRecommendedQuestions(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Add user context to the conversation for better responses
      const contextualMessages = [...messages, userMessage];
      if (isAuthenticated && user) {
        const contextMessage: Message = {
          id: 'context-' + Date.now().toString(),
          role: 'system',
          content: `User context: Customer named ${user.name}, location: ${user.location || 'Not specified'}. Provide personalized shopping assistance for agricultural products.`,
          timestamp: new Date(),
        };
        contextualMessages.unshift(contextMessage);
      }

      const response = await sendMessage(contextualMessages, 'gpt-4o-mini');
      
      // Clean the AI response to remove markdown formatting
      const cleanedResponse = formatChatText(response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanedResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Show recommended questions after bot responds
      setTimeout(() => {
        setShowRecommendedQuestions(true);
      }, 500);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setHasShownWelcome(false);
    setShowRecommendedQuestions(false);
    
    // Re-add welcome message after clearing
    setTimeout(() => {
      if (!import.meta.env.VITE_OPENAI_API_KEY) return;
      
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now().toString(),
        role: 'assistant',
        content: isAuthenticated 
          ? `สวัสดีคุณ${user?.name} ยินดีต้อนรับสู่ Farm2Hand AI Assistant\nต้องการให้ช่วยหาสินค้าหรือให้คำแนะนำอะไรดีครับ?`
          : 'ยินดีต้อนรับสู่Chatbot AI ของ Farm2Hand ครับ\nต้องการให้ช่วยอะไรดีครับ?',
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
      setHasShownWelcome(true);
      setShowRecommendedQuestions(true);
    }, 100);
  };

  const apiKeyMissing = !import.meta.env.VITE_OPENAI_API_KEY;

  // Show message for farmers that chatbot is not available
  if (isAuthenticated && user?.role === 'farmer') {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center">
        <div className="max-w-md text-center p-6">
          <div className="w-16 h-16 bg-nature-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <img 
              src="/farm2hand-logo.png" 
              alt="Farm2Hand Logo" 
              className="w-8 h-8 object-contain opacity-50"
            />
          </div>
          <h2 className="text-2xl font-semibold text-nature-dark-green mb-4">
            AI Assistant สำหรับลูกค้าเท่านั้น
          </h2>
          <p className="text-cool-gray leading-relaxed mb-6">
            ขออภัย AI Assistant นี้ถูกออกแบบมาเพื่อช่วยเหลือลูกค้าในการค้นหาและซื้อสินค้าเกษตร 
            สำหรับเกษตรกรสามารถใช้ระบบจัดการสินค้าและโปรไฟล์แทน
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200"
            >
              กลับหน้าก่อนหน้า
            </button>
            <a
              href="/profile"
              className="px-6 py-3 border border-nature-green text-nature-green hover:bg-nature-green hover:text-white rounded-lg font-medium transition-colors duration-200"
            >
              ไปที่โปรไฟล์
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* API Key Warning */}
      {apiKeyMissing && (
        <div className="flex items-center gap-3 px-6 py-3 bg-sun-yellow/20 border-b border-sun-yellow/30">
          <AlertCircle className="w-5 h-5 text-nature-brown flex-shrink-0" />
          <p className="text-sm text-nature-brown">
            Please add your OpenAI API key to the <code className="px-1 py-0.5 bg-white/50 rounded text-xs">`.env`</code> file as <code className="px-1 py-0.5 bg-white/50 rounded text-xs">`VITE_OPENAI_API_KEY`</code>
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 px-6 py-3 bg-red-100 border-b border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-border-beige">
        <div>
          <h2 className="text-lg font-semibold text-nature-dark-green">
            {isAuthenticated ? `AI Assistant สำหรับคุณ${user?.name}` : 'AI Assistant'}
          </h2>
          {isAuthenticated && (
            <p className="text-sm text-cool-gray">ผู้ช่วยส่วนตัวสำหรับการช้อปปิ้งสินค้าเกษตร</p>
          )}
        </div>
        <button
          onClick={clearChat}
          className="px-4 py-2 text-sm text-nature-green hover:text-nature-dark-green hover:bg-nature-green/10 rounded-lg transition-colors duration-200"
        >
          Clear Chat
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden p-2">
                <img 
                  src="/farm2hand-logo.png" 
                  alt="Farm2Hand Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-semibold text-nature-dark-green mb-2">
                {isAuthenticated ? `สวัสดีคุณ${user?.name}` : 'Welcome to Farm2Hand'}
              </h2>
              <p className="text-cool-gray leading-relaxed">
                {isAuthenticated 
                  ? 'เริ่มการสนทนาเพื่อค้นหาสินค้าเกษตรที่คุณต้องการ'
                  : 'Start a conversation by typing a message below.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Recommended Questions - Show after every bot response */}
            {showRecommendedQuestions && !loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
              <RecommendedQuestions onQuestionClick={handleRecommendedQuestion} />
            )}
            
            {loading && (
              <div className="flex gap-3 p-4 justify-start">
                <div className="flex gap-3 max-w-[70%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden p-1">
                    <img 
                      src="/farm2hand-logo.png" 
                      alt="Farm2Hand AI" 
                      className="w-full h-full object-contain animate-pulse"
                    />
                  </div>
                  <div className="px-4 py-3 bg-white rounded-2xl rounded-bl-md border border-border-beige shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-nature-green rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-nature-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-nature-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={loading || apiKeyMissing}
      />
    </div>
  );
};