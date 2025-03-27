
import { Document } from '@/types/document.types';

export const transformSupabaseToDocument = (doc: any): Document => ({
  id: doc.id,
  title: doc.title,
  moduleNumber: doc.moduleNumber,
  dueDate: doc.dueDate ? new Date(doc.dueDate) : undefined,
  lastModified: new Date(doc.last_modified),
  snippet: doc.snippet,
  referencesCount: doc.references_count || 0,
  content: doc.content,
});

export const transformDocumentToSupabase = (
  document: Omit<Document, 'id' | 'lastModified'>, 
  userId: string
) => ({
  title: document.title,
  moduleNumber: document.moduleNumber,
  dueDate: document.dueDate?.toISOString(),
  last_modified: new Date().toISOString(),
  snippet: document.snippet,
  references_count: document.referencesCount,
  content: document.content || '',
  user_id: userId,
});

export const prepareDocumentUpdate = (updates: Partial<Omit<Document, 'id'>>) => {
  const supabaseUpdates: any = {};
  
  if (updates.title !== undefined) supabaseUpdates.title = updates.title;
  if (updates.moduleNumber !== undefined) supabaseUpdates.moduleNumber = updates.moduleNumber;
  if (updates.dueDate !== undefined) supabaseUpdates.dueDate = updates.dueDate?.toISOString();
  if (updates.snippet !== undefined) supabaseUpdates.snippet = updates.snippet;
  if (updates.referencesCount !== undefined) supabaseUpdates.references_count = updates.referencesCount;
  if (updates.content !== undefined) supabaseUpdates.content = updates.content;
  
  // Always update last_modified
  supabaseUpdates.last_modified = new Date().toISOString();
  
  return supabaseUpdates;
};
