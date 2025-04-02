
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@/store/AuthContext';
import { KnowledgeBaseReference, KnowledgeBaseContextType } from '@/types/knowledgeBase.types';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';

const KnowledgeBaseContext = createContext<KnowledgeBaseContextType | undefined>(undefined);

export const KnowledgeBaseProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { 
    references, 
    loading, 
    fetchReferences, 
    addReference, 
    updateReference, 
    deleteReference,
    toggleFavorite
  } = useKnowledgeBase(user?.id);
  
  // Fetch references when user changes
  useEffect(() => {
    if (user?.id) {
      fetchReferences();
    }
  }, [user?.id]);

  return (
    <KnowledgeBaseContext.Provider value={{ 
      references, 
      loading, 
      addReference, 
      updateReference, 
      deleteReference,
      toggleFavorite
    }}>
      {children}
    </KnowledgeBaseContext.Provider>
  );
};

export const useKnowledgeBaseStore = () => {
  const context = useContext(KnowledgeBaseContext);
  if (context === undefined) {
    throw new Error('useKnowledgeBaseStore must be used within a KnowledgeBaseProvider');
  }
  return context;
};
