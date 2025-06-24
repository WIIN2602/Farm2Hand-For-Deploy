import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on your table structure
export interface Farm2HandUser {
  id: number;
  Name: string | null;
  Email: string | null;
  role: string | null;
  Phone: string | null;
  Address: string | null;
  created_at: string;
  Password: string | null;
}

// Type for user data without sensitive information
export interface UserProfile {
  id: number;
  Name: string;
  Email: string;
  role: 'farmer' | 'customer';
  Phone?: string;
  Address?: string;
  created_at: string;
}

// Customer data table type
export interface Farm2HandCustomerData {
  session_id: number;
  id_user: number;
  favorites: string | null;
  following: string | null;
  created_at: string;
  updated_at: string;
}

// Customer data for frontend use
export interface CustomerData {
  sessionId: number;
  userId: number;
  favorites: string[];
  following: string[];
  createdAt: string;
  updatedAt: string;
}