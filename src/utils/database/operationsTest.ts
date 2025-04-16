import { supabase } from '@/lib/supabase';
import { DatabaseOperationsResults } from './types';

export const testDatabaseOperations = async (userId: string): Promise<DatabaseOperationsResults> => {
  const results: DatabaseOperationsResults = {
    documentsInsert: false,
    documentsQuery: false,
    referencesInsert: false,
    referencesQuery: false,
    aiChatHistoryInsert: false,
    aiChatHistoryQuery: false,
    documentVersionsInsert: false,
    documentVersionsQuery: false,
    testDocumentId: ''
  };
  
  try {
    // Start with testing document operations
    await testDocumentOperations(userId, results);
    
    return results;
  } catch (error) {
    console.error('Error testing database operations:', error);
    return results;
  }
};

// Helper function to test document operations
async function testDocumentOperations(userId: string, results: DatabaseOperationsResults): Promise<void> {
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
    return;
  } 
  
  if (docData) {
    results.documentsInsert = true;
    results.testDocumentId = docData.id;
    
    // 2. Test querying document
    await testDocumentQuery(docData.id, results);
    
    // 3. Test reference operations if document was created successfully
    await testReferenceOperations(docData.id, userId, results);
    
    // 4. Test chat history operations if document was created successfully
    await testChatHistoryOperations(docData.id, userId, results);
    
    // 5. Test document version operations if document was created successfully
    await testDocumentVersionOperations(docData.id, userId, results);
    
    // Clean up the test document
    await supabase
      .from('documents')
      .delete()
      .eq('id', docData.id);
  }
}

// Helper function to test document query
async function testDocumentQuery(documentId: string, results: DatabaseOperationsResults): Promise<void> {
  const { data: queryData, error: queryError } = await supabase
    .from('documents')
    .select()
    .eq('id', documentId)
    .single();
    
  if (queryError) {
    console.error('Error querying test document:', queryError);
  } else if (queryData) {
    results.documentsQuery = true;
  }
}

// Helper function to test reference operations
async function testReferenceOperations(documentId: string, userId: string, results: DatabaseOperationsResults): Promise<void> {
  const { data: refData, error: refError } = await supabase
    .from('references')
    .insert({
      title: 'Test Reference',
      authors: ['Test Author'],
      year: '2025',
      source: 'Test Journal',
      format: 'APA',
      document_id: documentId,
      user_id: userId
    })
    .select()
    .single();
    
  if (refError) {
    console.error('Error inserting test reference:', refError);
    return;
  }
  
  if (refData) {
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
}

// Helper function to test chat history operations
async function testChatHistoryOperations(documentId: string, userId: string, results: DatabaseOperationsResults): Promise<void> {
  // First check if the ai_chat_history table exists
  const { data: tableCheck } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'ai_chat_history');
    
  if (!tableCheck || tableCheck.length === 0) {
    return; // Table doesn't exist, skip this test
  }
  
  const { data: chatData, error: chatError } = await supabase
    .from('ai_chat_history')
    .insert({
      document_id: documentId,
      user_id: userId,
      role: 'assistant',
      content: 'Test message',
      timestamp: new Date().toISOString()
    })
    .select()
    .single();
    
  if (chatError) {
    console.error('Error inserting test chat message:', chatError);
    return;
  }
  
  if (chatData) {
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

// Add new test for document versions
async function testDocumentVersionOperations(documentId: string, userId: string, results: DatabaseOperationsResults): Promise<void> {
  const { data: versionData, error: versionError } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      content: '<p>Test version content</p>',
      version_number: 1,
      user_id: userId,
      title: 'Test Version'
    })
    .select()
    .single();
    
  if (versionError) {
    console.error('Error inserting test document version:', versionError);
    return;
  }
  
  if (versionData) {
    results.documentVersionsInsert = true;
    
    // Query the version
    const { data: queryData, error: queryError } = await supabase
      .from('document_versions')
      .select()
      .eq('id', versionData.id)
      .single();
      
    if (queryError) {
      console.error('Error querying test document version:', queryError);
    } else if (queryData) {
      results.documentVersionsQuery = true;
    }
    
    // Clean up the test version
    await supabase
      .from('document_versions')
      .delete()
      .eq('id', versionData.id);
  }
}
