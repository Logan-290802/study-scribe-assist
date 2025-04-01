
import { supabase } from '@/lib/supabase';

// Types for the table information
interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

// Function to check if all required tables exist
export const checkDatabaseTables = async () => {
  const results = {
    documents: false,
    references: false,
    ai_chat_history: false,
    columnsInfo: {} as Record<string, TableInfo[]>,
    foreignKeys: {} as Record<string, any[]>
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
          const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_schema', 'public')
            .eq('table_name', tableName);
            
          if (columnsError) {
            console.error(`Error getting columns for ${tableName}:`, columnsError);
          } else if (columns) {
            results.columnsInfo[tableName] = columns;
          }
          
          // Check foreign keys
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
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error checking database structure:', error);
    return results;
  }
};

// Function to test inserting/querying data for each table
export const testDatabaseOperations = async (userId: string) => {
  const results = {
    documentsInsert: false,
    documentsQuery: false,
    referencesInsert: false,
    referencesQuery: false,
    aiChatHistoryInsert: false,
    aiChatHistoryQuery: false,
    testDocumentId: ''
  };
  
  try {
    // Test documents table
    // 1. Insert a test document
    const testTitle = `Test Document ${new Date().toISOString()}`;
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        title: testTitle,
        snippet: 'Test snippet',
        content: '<p>Test content</p>',
        last_modified: new Date().toISOString(),
        references_count: 0,
        user_id: userId
      })
      .select()
      .single();
      
    if (docError) {
      console.error('Error inserting test document:', docError);
    } else if (docData) {
      results.documentsInsert = true;
      results.testDocumentId = docData.id;
      
      // 2. Query the document
      const { data: queryData, error: queryError } = await supabase
        .from('documents')
        .select()
        .eq('id', docData.id)
        .single();
        
      if (queryError) {
        console.error('Error querying test document:', queryError);
      } else if (queryData) {
        results.documentsQuery = true;
        
        // Test references table if documents worked
        const { data: refData, error: refError } = await supabase
          .from('references')
          .insert({
            title: 'Test Reference',
            authors: ['Test Author'],
            year: '2025',
            source: 'Test Journal',
            format: 'APA',
            document_id: docData.id,
            user_id: userId
          })
          .select()
          .single();
          
        if (refError) {
          console.error('Error inserting test reference:', refError);
        } else if (refData) {
          results.referencesInsert = true;
          
          // Query the reference
          const { data: refQueryData, error: refQueryError } = await supabase
            .from('references')
            .select()
            .eq('id', refData.id)
            .single();
            
          if (refQueryError) {
            console.error('Error querying test reference:', refQueryError);
          } else if (refQueryData) {
            results.referencesQuery = true;
          }
          
          // Clean up the test reference
          await supabase
            .from('references')
            .delete()
            .eq('id', refData.id);
        }
        
        // Test ai_chat_history table if it exists
        const { data: tableCheck } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'ai_chat_history');
          
        if (tableCheck && tableCheck.length > 0) {
          const { data: chatData, error: chatError } = await supabase
            .from('ai_chat_history')
            .insert({
              document_id: docData.id,
              user_id: userId,
              role: 'assistant',
              content: 'Test message',
              timestamp: new Date().toISOString()
            })
            .select()
            .single();
            
          if (chatError) {
            console.error('Error inserting test chat message:', chatError);
          } else if (chatData) {
            results.aiChatHistoryInsert = true;
            
            // Query the chat message
            const { data: chatQueryData, error: chatQueryError } = await supabase
              .from('ai_chat_history')
              .select()
              .eq('id', chatData.id)
              .single();
              
            if (chatQueryError) {
              console.error('Error querying test chat message:', chatQueryError);
            } else if (chatQueryData) {
              results.aiChatHistoryQuery = true;
            }
            
            // Clean up the test chat message
            await supabase
              .from('ai_chat_history')
              .delete()
              .eq('id', chatData.id);
          }
        }
        
        // Clean up the test document
        await supabase
          .from('documents')
          .delete()
          .eq('id', docData.id);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error testing database operations:', error);
    return results;
  }
};
