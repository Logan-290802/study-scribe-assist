// Types for database checking functionality
export interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

// Modified interface for column information that doesn't require table_name
export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

// New type for document versions
export interface DocumentVersion {
  id: string;
  document_id: string;
  content: string | null;
  version_number: number;
  created_at: string;
  user_id: string;
  title: string;
}

// Results of database structure check
export interface DatabaseStructureResults {
  documents: boolean;
  references: boolean;
  ai_chat_history: boolean;
  document_versions: boolean;
  citation_formats: boolean;
  reference_materials: boolean;
  columnsInfo: Record<string, ColumnInfo[]>;
  foreignKeys: Record<string, any[]>;
}

// Results of database operations test
export interface DatabaseOperationsResults {
  documentsInsert: boolean;
  documentsQuery: boolean;
  referencesInsert: boolean;
  referencesQuery: boolean;
  aiChatHistoryInsert: boolean;
  aiChatHistoryQuery: boolean;
  documentVersionsInsert: boolean;
  documentVersionsQuery: boolean;
  testDocumentId: string;
}
