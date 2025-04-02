
export interface KnowledgeBaseReference {
  id: string;
  title: string;
  authors: string[];
  year: string;
  type: 'journal' | 'book' | 'website' | 'conference' | 'other';
  summary: string;
  tags: string[];
  has_pdf: boolean;
  discipline: string;
  usage_count: number;
  date_added: Date;
  is_favorite: boolean;
  user_id: string;
  document_id?: string;
  pdf_path?: string;
  source_url?: string;
  citation_format?: 'APA' | 'MLA' | 'Harvard';
}

export interface KnowledgeBaseContextType {
  references: KnowledgeBaseReference[];
  loading: boolean;
  addReference: (reference: Omit<KnowledgeBaseReference, 'id' | 'date_added' | 'usage_count'>) => Promise<string>;
  updateReference: (id: string, updates: Partial<Omit<KnowledgeBaseReference, 'id'>>) => Promise<void>;
  deleteReference: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}
