import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-3">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            disabled={disabled}
            className="w-full px-3 py-2 pr-10 bg-white border border-border-beige rounded-lg text-cool-gray placeholder-cool-gray/60 focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent resize-none min-h-[40px] max-h-20 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
            rows={1}
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="absolute right-1 bottom-1 p-1.5 bg-fresh-orange hover:bg-fresh-orange-hover disabled:bg-cool-gray/30 disabled:cursor-not-allowed rounded-md transition-colors duration-200 shadow-sm"
          >
            {disabled ? (
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};