import type { Message } from '../types/chat';

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Available models
export const AVAILABLE_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-3.5-turbo'
] as const;

export type OpenAIModel = typeof AVAILABLE_MODELS[number];

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// System prompt for Farm2Hand AI Assistant
const SYSTEM_PROMPT = `You are a helpful AI assistant for Farm2Hand, an agricultural e-commerce platform in Thailand. Your role is to help customers find agricultural products, provide farming advice, and assist with shopping.

Key information about Farm2Hand:
- We connect farmers directly with consumers
- We sell fresh vegetables, fruits, rice, eggs, and seasonal products
- We offer both organic and conventional products
- We provide delivery services across Thailand
- We support local farmers and sustainable agriculture

Guidelines for responses:
- Always respond in Thai language
- Be helpful, friendly, and knowledgeable about agriculture
- Provide specific product recommendations when asked
- Help customers find what they're looking for
- Give farming tips and advice when relevant
- Keep responses concise but informative
- If you don't know something specific about our inventory, suggest they browse our products page

You can help with:
- Product recommendations
- Farming advice and tips
- Seasonal produce information
- Organic vs conventional farming
- Storage and preparation tips
- General shopping assistance

Always maintain a helpful and professional tone while being conversational and approachable.`;

/**
 * Send a message to OpenAI and get a response
 */
export async function sendMessage(
  messages: Message[],
  model: OpenAIModel = 'gpt-4o-mini'
): Promise<string> {
  if (!API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  try {
    // Convert our message format to OpenAI format
    const openAIMessages: OpenAIMessage[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      ...messages
        .filter(msg => msg.role !== 'system') // Remove any existing system messages
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
    ];

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: openAIMessages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY in the .env file.');
      } else if (response.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else if (response.status === 500) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
    }

    const data: OpenAIResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response received from OpenAI');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to get response from AI assistant. Please try again.');
  }
}

/**
 * Check if OpenAI API is properly configured
 */
export function isOpenAIConfigured(): boolean {
  return !!API_KEY && API_KEY.startsWith('sk-');
}

/**
 * Get available models
 */
export function getAvailableModels(): readonly OpenAIModel[] {
  return AVAILABLE_MODELS;
}