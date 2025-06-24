export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}