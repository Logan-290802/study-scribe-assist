
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
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

