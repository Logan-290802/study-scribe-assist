
export interface Reference {
  id: string;
  title: string;
  authors: string[];
  year: string;
  url?: string;
  source: string;
  format: 'APA' | 'MLA' | 'Harvard';
  content?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AiChatProps {
  onAddReference: (reference: Reference) => void;
  onNewMessage?: (message: string) => void;
  documentId?: string;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
}
