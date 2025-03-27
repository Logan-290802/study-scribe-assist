
import { createClient } from '@supabase/supabase-js';

// Use the provided Supabase URL and anon key
const supabaseUrl = 'https://icpophaaxzftjsesephp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcG9waGFheHpmdGpzZXNlcGhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTA3MTEsImV4cCI6MjA1ODY4NjcxMX0.qckabQzKlWt2zEU-hXgP_qSiywoy3Ndn7ZHDFP6vfe8';

// Create Supabase client with the configuration
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

// Updated to match Supabase's snake_case convention
export type Document = {
  id: string;
  title: string;
  moduleNumber?: string;
  dueDate?: string;
  last_modified: string;  // Note: snake_case for Supabase
  snippet: string;
  references_count: number;  // Note: snake_case for Supabase
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
