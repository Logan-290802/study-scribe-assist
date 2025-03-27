
import { createClient } from '@supabase/supabase-js';

// Default to empty strings instead of undefined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we're in development and provide fallback values when env vars aren't set
const isDevelopment = import.meta.env.DEV;

if ((!supabaseUrl || !supabaseAnonKey) && isDevelopment) {
  console.warn('Missing Supabase URL or Anon Key. Using mock Supabase client for development.');
  console.warn('Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Create a mock Supabase client for development if credentials are missing
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

export type Document = {
  id: string;
  title: string;
  moduleNumber?: string;
  dueDate?: string;
  lastModified: string;
  snippet: string;
  referencesCount: number;
  content?: string;
  user_id: string;
};

export type Reference = {
  id: string;
  title: string;
  authors: string[];
  year: string;
  url?: string;
  source: string;
  format: 'APA' | 'MLA' | 'Harvard';
  content?: string;
  document_id: string;
  user_id: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  document_id?: string;
  user_id: string;
};

export type FileUpload = {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  document_id?: string;
  user_id: string;
  created_at: string;
};
