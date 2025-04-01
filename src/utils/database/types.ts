
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

// Results of database structure check
export interface DatabaseStructureResults {
  documents: boolean;
  references: boolean;
  ai_chat_history: boolean;
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
  testDocumentId: string;
}
