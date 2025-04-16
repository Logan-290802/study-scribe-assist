
export interface Reference {
  id: string;
  title: string;
  authors: string[];
  year: string;
  url?: string;
  source: string;
  format: 'APA' | 'MLA' | 'Harvard';
  content?: string;
  file_path?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Message extends ChatMessage {}

export interface AiChatProps {
  onAddReference: (reference: Reference) => void;
  onNewMessage?: (message: string) => void;
  documentId?: string;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
  onAddToKnowledgeBase?: (item: any) => Promise<any>;
}
