import React from 'react';
import { User } from 'lucide-react';
import type { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md overflow-hidden ${
          isUser ? 'bg-nature-brown' : 'bg-white'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <div className="p-1 w-full h-full">
              <img 
                src="/home/project/public/farm2hand-logo.png" 
                alt="Farm2Hand AI" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
        
        {/* Message Bubble */}
        <div className="flex flex-col">
          <div className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser 
              ? 'bg-nature-green text-white rounded-br-md' 
              : 'bg-white text-cool-gray rounded-bl-md border border-border-beige'
          }`}>
            <div className="leading-relaxed whitespace-pre-wrap break-words text-sm">
              {message.content}
            </div>
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-cool-gray/60 mt-1 px-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};