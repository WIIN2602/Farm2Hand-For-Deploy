import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Minimize2, AlertCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { RecommendedQuestions } from './RecommendedQuestions';
import { sendMessage } from '../services/openai';
import { formatChatText } from '../utils/textUtils';
import { useAuth } from '../contexts/AuthContext';
import type { Message } from '../types/chat';

export const ChatbotPopup: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [showRecommendedQuestions, setShowRecommendedQuestions] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine if the popup should render - hide only for farmers or on chatbot page
  const shouldRenderPopup = !(
    (isAuthenticated && user?.role === 'farmer') || 
    location.pathname === '/chatbot'
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when chatbot opens for the first time
  useEffect(() => {
    if (isOpen && !hasShownWelcome && !import.meta.env.VITE_OPENAI_API_KEY) {
      return;
    }

    if (isOpen && !hasShownWelcome) {
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now().toString(),
        role: 'assistant',
        content: isAuthenticated 
          ? `สวัสดีคุณ${user?.name} ยินดีต้อนรับสู่ Farm2Hand AI Assistant\nต้องการให้ช่วยหาสินค้าหรือให้คำแนะนำอะไรดีครับ?`
          : 'ยินดีต้อนรับสู่ Farm2Hand AI Assistant ครับ\nต้องการให้ช่วยหาสินค้าเกษตรหรือให้คำแนะนำอะไรดีครับ?\n\nหากต้องการประสบการณ์ที่ดีขึ้น แนะนำให้เข้าสู่ระบบเพื่อรับคำแนะนำที่เหมาะกับคุณ',
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
      setHasShownWelcome(true);
      setShowRecommendedQuestions(true);
    }
  }, [isOpen, hasShownWelcome, isAuthenticated, user?.name]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

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
      } else {
        // Add context for non-authenticated users
        const contextMessage: Message = {
          id: 'context-' + Date.now().toString(),
          role: 'system',
          content: `User context: Anonymous visitor browsing Farm2Hand. Provide general shopping assistance for agricultural products and encourage registration for personalized experience.`,
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
      
      // Show notification if chatbot is closed or minimized
      if (!isOpen || isMinimized) {
        setHasNewMessage(true);
      }
      
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
    
    setTimeout(() => {
      if (!import.meta.env.VITE_OPENAI_API_KEY) return;
      
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now().toString(),
        role: 'assistant',
        content: isAuthenticated 
          ? `สวัสดีคุณ${user?.name} ยินดีต้อนรับสู่ Farm2Hand AI Assistant\nต้องการให้ช่วยหาสินค้าหรือให้คำแนะนำอะไรดีครับ?`
          : 'ยินดีต้อนรับสู่ Farm2Hand AI Assistant ครับ\nต้องการให้ช่วยหาสินค้าเกษตรหรือให้คำแนะนำอะไรดีครับ?\n\nหากต้องการประสบการณ์ที่ดีขึ้น แนะนำให้เข้าสู่ระบบเพื่อรับคำแนะนำที่เหมาะกับคุณ',
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
      setHasShownWelcome(true);
      setShowRecommendedQuestions(true);
    }, 100);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasNewMessage(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    setHasNewMessage(false);
  };

  const apiKeyMissing = !import.meta.env.VITE_OPENAI_API_KEY;

  // Single conditional return at the end after all hooks have been processed
  if (!shouldRenderPopup) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 w-16 h-16 bg-nature-green hover:bg-nature-dark-green text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
          {hasNewMessage && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">!</span>
            </div>
          )}
        </button>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }`}>
          <div className="bg-white rounded-xl shadow-2xl border border-border-beige overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-nature-dark-green text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
                  <img 
                    src="/home/project/public/farm2hand-logo.png" 
                    alt="Farm2Hand Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Farm2Hand AI</h3>
                  {!isMinimized && (
                    <p className="text-xs text-white/80">
                      {isAuthenticated ? `ผู้ช่วยส่วนตัวของคุณ${user?.name}` : 'ผู้ช่วยอัจฉริยะสำหรับสินค้าเกษตร'}
                    </p>
                  )}
                </div>
                {hasNewMessage && isMinimized && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {!isMinimized && (
                  <>
                    <button
                      onClick={clearChat}
                      className="text-white/80 hover:text-white text-xs px-2 py-1 hover:bg-nature-green/20 rounded transition-colors duration-200"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleMinimize}
                      className="text-white/80 hover:text-white p-1 hover:bg-nature-green/20 rounded transition-colors duration-200"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                {isMinimized && (
                  <button
                    onClick={handleMaximize}
                    className="text-white/80 hover:text-white p-1 hover:bg-nature-green/20 rounded transition-colors duration-200"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white p-1 hover:bg-red-500/20 rounded transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* API Key Warning */}
                {apiKeyMissing && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-sun-yellow/20 border-b border-sun-yellow/30">
                    <AlertCircle className="w-4 h-4 text-nature-brown flex-shrink-0" />
                    <p className="text-xs text-nature-brown">
                      API key required in <code className="px-1 py-0.5 bg-white/50 rounded text-xs">`.env`</code>
                    </p>
                  </div>
                )}

                {/* Login Suggestion for Non-authenticated Users */}
                {!isAuthenticated && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-nature-green/10 border-b border-nature-green/20">
                    <AlertCircle className="w-4 h-4 text-nature-green flex-shrink-0" />
                    <p className="text-xs text-nature-dark-green">
                      เข้าสู่ระบบเพื่อรับคำแนะนำที่เหมาะกับคุณ
                    </p>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-100 border-b border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-xs text-red-700">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto bg-gradient-to-br from-soft-beige to-light-beige">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center p-4">
                      <div className="max-w-xs">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg overflow-hidden p-1">
                          <img 
                            src="/home/project/public/farm2hand-logo.png" 
                            alt="Farm2Hand Logo" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <h4 className="text-lg font-semibold text-nature-dark-green mb-1">
                          Farm2Hand AI
                        </h4>
                        <p className="text-sm text-cool-gray leading-relaxed">
                          {isAuthenticated 
                            ? `สวัสดีคุณ${user?.name}\nพิมพ์ข้อความเพื่อเริ่มการสนทนา`
                            : 'สวัสดีครับ\nพิมพ์ข้อความเพื่อเริ่มการสนทนา\nหรือเข้าสู่ระบบเพื่อประสบการณ์ที่ดีขึ้น'
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                      ))}
                      
                      {/* Recommended Questions */}
                      {showRecommendedQuestions && !loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                        <div className="px-2">
                          <RecommendedQuestions onQuestionClick={handleRecommendedQuestion} />
                        </div>
                      )}
                      
                      {loading && (
                        <div className="flex gap-2 p-3 justify-start">
                          <div className="flex gap-2 max-w-[70%]">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden p-1">
                              <img 
                                src="/home/project/public/farm2hand-logo.png" 
                                alt="Farm2Hand AI" 
                                className="w-full h-full object-contain animate-pulse"
                              />
                            </div>
                            <div className="px-3 py-2 bg-white rounded-2xl rounded-bl-md border border-border-beige shadow-sm">
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-nature-green rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-nature-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1.5 h-1.5 bg-nature-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                <div className="border-t border-border-beige bg-white">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={loading || apiKeyMissing}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};