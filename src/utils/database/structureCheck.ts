
import { supabase } from '@/lib/supabase';
import { DatabaseStructureResults, ColumnInfo } from './types';

// Function to check if all required tables exist and get their structure
export const checkDatabaseTables = async (): Promise<DatabaseStructureResults> => {
  const results: DatabaseStructureResults = {
    documents: false,
    references: false,
    ai_chat_history: false,
    columnsInfo: {},
    foreignKeys: {}
  };
  
  try {
    // Check which tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (error) {
      console.error('Error checking tables:', error);
      return results;
    }
    
    if (tables) {
      // Check each required table
      results.documents = tables.some(t => t.table_name === 'documents');
      results.references = tables.some(t => t.table_name === 'references');
      results.ai_chat_history = tables.some(t => t.table_name === 'ai_chat_history');
      
      // Get column information for each existing table
      for (const tableName of ['documents', 'references', 'ai_chat_history']) {
        if (tables.some(t => t.table_name === tableName)) {
          await getTableColumns(tableName, results);
          await getTableForeignKeys(tableName, results);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error checking database structure:', error);
    return results;
  }
};

// Helper function to get column information for a table
async function getTableColumns(tableName: string, results: DatabaseStructureResults): Promise<void> {
  const { data: columns, error: columnsError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_schema', 'public')
    .eq('table_name', tableName);
    
  if (columnsError) {
    console.error(`Error getting columns for ${tableName}:`, columnsError);
  } else if (columns) {
    // Store as ColumnInfo[] which doesn't require table_name
    results.columnsInfo[tableName] = columns as ColumnInfo[];
  }
}

// Helper function to get foreign key information for a table
async function getTableForeignKeys(tableName: string, results: DatabaseStructureResults): Promise<void> {
  const { data: foreignKeys, error: fkError } = await supabase
    .from('information_schema.key_column_usage')
    .select(`
      constraint_name,
      column_name,
      referenced_table_schema,
      referenced_table_name,
      referenced_column_name
    `)
    .eq('table_schema', 'public')
    .eq('table_name', tableName)
    .not('referenced_table_name', 'is', null);
    
  if (fkError) {
    console.error(`Error getting foreign keys for ${tableName}:`, fkError);
  } else if (foreignKeys) {
    results.foreignKeys[tableName] = foreignKeys;
  }
}
