
export interface Document {
  id: string;
  title: string;
  moduleNumber?: string;
  dueDate?: Date;
  lastModified: Date;
  snippet: string;
  referencesCount: number;
  content?: string;
  archived?: boolean;
}

export interface DocumentContextType {
  documents: Document[];
  loading: boolean;
  addDocument: (document: Omit<Document, 'id' | 'lastModified'>) => Promise<string>;
  updateDocument: (id: string, updates: Partial<Omit<Document, 'id'>>) => Promise<void>;
  getDocument: (id: string) => Document | undefined;
  deleteDocument: (id: string) => Promise<void>;
  archiveDocument: (id: string, archived: boolean) => Promise<void>;
}
