
import React from 'react';
import { useAuth } from '@/store/AuthContext';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import KnowledgeBaseItem from './KnowledgeBaseItem';
import { Book, Search } from 'lucide-react';

interface KnowledgeBaseProps {
  searchQuery: string;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ searchQuery }) => {
  const { user } = useAuth();
  const { knowledgeBaseItems, isLoading, deleteItem } = useKnowledgeBase(user?.id);
  
  // Filter items based on search query
  const filteredItems = knowledgeBaseItems.filter(item => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      (item.content && item.content.toLowerCase().includes(searchLower)) ||
      (item.authors && item.authors.some(author => author.toLowerCase().includes(searchLower))) ||
      (item.source && item.source.toLowerCase().includes(searchLower))
    );
  });

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-gray-500">Loading knowledge base...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Book className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="font-medium text-lg mb-2">Sign in to view your knowledge base</h3>
        <p className="text-gray-500 max-w-md">
          Your knowledge base helps you organize references and uploaded files for your research.
        </p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {searchQuery ? (
          <>
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="font-medium text-lg mb-2">No results found</h3>
            <p className="text-gray-500 max-w-md">
              No items matching "{searchQuery}" were found in your knowledge base.
            </p>
          </>
        ) : (
          <>
            <Book className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="font-medium text-lg mb-2">Your knowledge base is empty</h3>
            <p className="text-gray-500 max-w-md">
              Upload files or add references to your documents to build your knowledge base.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredItems.map(item => (
        <KnowledgeBaseItem 
          key={item.id} 
          item={item} 
          onDelete={handleDeleteItem}
        />
      ))}
    </div>
  );
};

export default KnowledgeBase;
