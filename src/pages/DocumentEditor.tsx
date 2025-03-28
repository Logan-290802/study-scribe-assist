import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/components/ui/use-toast';
import { useDocuments } from '@/store/DocumentStore';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';
import { Reference } from '@/components/ai/AiChat';
import DocumentHeader from '@/components/document/DocumentHeader';
import EditorArea from '@/components/document/EditorArea';
import DocumentToolsPanel from '@/components/document/DocumentToolsPanel';
import ChatSidebar from '@/components/document/ChatSidebar';

const DocumentEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getDocument, updateDocument } = useDocuments();
  const { user } = useAuth();

  const document = id ? getDocument(id) : undefined;

  const [documentTitle, setDocumentTitle] = useState(document?.title || 'Untitled Document');
  const [documentContent, setDocumentContent] = useState(document?.content || '');
  const [references, setReferences] = useState<Reference[]>([]);
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI research assistant. How can I help you today?' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (document) {
      setDocumentTitle(document.title);
      setDocumentContent(document.content || '');
    }
  }, [document]);
  
  useEffect(() => {
    if (!id || !user) return;

    const fetchReferences = async () => {
      try {
        const { data, error } = await supabase
          .from('references')
          .select('*')
          .eq('document_id', id)
          .eq('user_id', user.id);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const transformedRefs: Reference[] = data.map(ref => ({
            id: ref.id,
            title: ref.title,
            authors: ref.authors,
            year: ref.year,
            source: ref.source,
            url: ref.url,
            format: ref.format,
            content: ref.content,
          }));
          
          setReferences(transformedRefs);
        }
      } catch (error) {
        console.error('Error fetching references:', error);
      }
    };

    fetchReferences();
  }, [id, user]);
  
  useEffect(() => {
    if (!id || !user) return;

    const fetchChatHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_chat_history')
          .select('*')
          .eq('document_id', id)
          .eq('user_id', user.id)
          .order('timestamp', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const history = data.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }));
          
          setAiChatHistory(history);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [id, user]);
  
  const handleSave = async () => {
    if (!id || !user) return;
    
    try {
      setIsSaving(true);
      
      await updateDocument(id, {
        title: documentTitle,
        content: documentContent,
        snippet: documentContent.substring(0, 150) + '...',
      });
      
      toast({
        title: "Document saved",
        description: "Your document has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error saving document",
        description: "There was an error saving your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiAction = (action: string, selection: string) => {
    const userQuery = `Please ${action} the following text: "${selection}"`;
    const newMessage = { role: 'user' as const, content: userQuery };
    setAiChatHistory([...aiChatHistory, newMessage]);
    
    if (id && user) {
      supabase.from('ai_chat_history').insert({
        document_id: id,
        user_id: user.id,
        role: 'user',
        content: userQuery,
        timestamp: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.error('Error saving chat message:', error);
      });
    }
    
    setTimeout(() => {
      let response;
      switch (action) {
        case 'elaborate':
          response = `I've expanded on your selection by adding more context and details. "${selection}" could be enhanced with additional supporting evidence...`;
          break;
        case 'summarize':
          response = `Here's a concise summary of your text: The main point of "${selection}" is...`;
          break;
        case 'research':
          response = `Based on my research about "${selection}", here are some relevant facts and sources: ...`;
          break;
        default:
          response = `I've analyzed "${selection}" as requested.`;
      }
      
      const aiResponse = { role: 'assistant' as const, content: response };
      setAiChatHistory(prevHistory => [...prevHistory, aiResponse]);
      
      if (id && user) {
        supabase.from('ai_chat_history').insert({
          document_id: id,
          user_id: user.id,
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
        }).then(({ error }) => {
          if (error) console.error('Error saving AI response:', error);
        });
      }
    }, 1000);
  };
  
  const handleAddReference = async (reference: Reference) => {
    if (!id || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('references')
        .insert({
          title: reference.title,
          authors: reference.authors,
          year: reference.year,
          source: reference.source,
          url: reference.url,
          format: reference.format,
          content: reference.content,
          document_id: id,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const newReference: Reference = {
        id: data.id,
        title: data.title,
        authors: data.authors,
        year: data.year,
        source: data.source,
        url: data.url,
        format: data.format as 'APA' | 'MLA' | 'Harvard',
        content: data.content,
      };
      
      setReferences([...references, newReference]);
      
      await updateDocument(id, {
        referencesCount: references.length + 1,
      });
      
      toast({
        title: "Reference added",
        description: `${reference.title} has been added to your references.`,
      });
    } catch (error) {
      console.error('Error adding reference:', error);
      toast({
        title: "Error adding reference",
        description: "There was an error adding the reference. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteReference = async (referenceId: string) => {
    if (!id || !user) return;
    
    try {
      const { error } = await supabase
        .from('references')
        .delete()
        .eq('id', referenceId)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      setReferences(references.filter(ref => ref.id !== referenceId));
      
      await updateDocument(id, {
        referencesCount: references.length - 1,
      });
      
      toast({
        title: "Reference removed",
        description: "The reference has been removed from your document.",
      });
    } catch (error) {
      console.error('Error deleting reference:', error);
      toast({
        title: "Error removing reference",
        description: "There was an error removing the reference. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!document) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold mb-4">Document not found</h1>
          <button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-full">
        <DocumentHeader 
          documentTitle={documentTitle}
          onTitleChange={setDocumentTitle}
          onSave={handleSave}
          isSaving={isSaving}
        />
        
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <EditorArea 
              content={documentContent}
              onChange={setDocumentContent}
              onAiAction={handleAiAction}
            />
            
            <DocumentToolsPanel
              references={references}
              documentTitle={documentTitle}
              documentContent={documentContent}
              aiChatHistory={aiChatHistory}
              onAddReference={handleAddReference}
              onDeleteReference={handleDeleteReference}
            />
          </div>
          
          <div className="col-span-12 lg:col-span-4">
            <ChatSidebar 
              documentId={id || ''}
              onAddReference={handleAddReference}
              chatHistory={aiChatHistory}
              setChatHistory={setAiChatHistory}
              userId={user?.id}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentEditor;
