
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { fetchKnowledgeBaseItems, addKnowledgeBaseItem, deleteKnowledgeBaseItem, KnowledgeBaseItem } from '@/services/KnowledgeBaseService';

export const useKnowledgeBase = (userId: string | undefined) => {
  const [knowledgeBaseItems, setKnowledgeBaseItems] = useState<KnowledgeBaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    
    const loadKnowledgeBase = async () => {
      setIsLoading(true);
      try {
        const items = await fetchKnowledgeBaseItems(userId);
        setKnowledgeBaseItems(items);
      } catch (error) {
        console.error('Error loading knowledge base:', error);
        toast({
          title: 'Error',
          description: 'Failed to load knowledge base items',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadKnowledgeBase();
  }, [userId, toast]);

  const addItem = async (item: Omit<KnowledgeBaseItem, 'id' | 'created_at'>) => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to your knowledge base',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      const newItem = await addKnowledgeBaseItem({
        ...item,
        user_id: userId,
      });
      
      if (newItem) {
        setKnowledgeBaseItems(prev => [newItem, ...prev]);
        toast({
          title: 'Item added',
          description: 'Successfully added to your knowledge base',
        });
        return newItem;
      }
      return null;
    } catch (error) {
      console.error('Error adding knowledge base item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to knowledge base',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteItem = async (id: string) => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to delete items from your knowledge base',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      const success = await deleteKnowledgeBaseItem(id, userId);
      
      if (success) {
        setKnowledgeBaseItems(prev => prev.filter(item => item.id !== id));
        toast({
          title: 'Item deleted',
          description: 'Successfully removed from your knowledge base',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting knowledge base item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item from knowledge base',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    knowledgeBaseItems,
    isLoading,
    addItem,
    deleteItem
  };
};
