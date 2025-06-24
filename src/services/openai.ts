import OpenAI from 'openai';
import type { Message } from '../types/chat';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file.');
}

const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
}) : null;

export const sendMessage = async (
  messages: Message[],
  model: string = 'gpt-4o-mini'
): Promise<string> => {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful male AI assistant for Farm2Hand, an online agricultural marketplace in Thailand. You help users with product inquiries, ordering, and general questions about fresh produce from local farmers. Always respond in Thai and end every response with "ครับ" to maintain a polite, masculine tone. Replace any mention of "ตลาดเกษตรกรออนไลน์" with "Farm2Hand".'
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    let botResponse = response.choices[0]?.message?.content || 'ขออภัยครับ ไม่สามารถตอบได้ในขณะนี้ครับ';
    
    // Replace "ตลาดเกษตรกรออนไลน์" with "Farm2Hand" in the bot's response
    botResponse = botResponse.replace(/ตลาดเกษตรกรออนไลน์/g, 'Farm2Hand');
    
    // Ensure the response ends with "ครับ" if it doesn't already
    if (!botResponse.trim().endsWith('ครับ')) {
      botResponse = botResponse.trim() + ' ครับ';
    }
    
    return botResponse;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to get response from OpenAI');
  }
};