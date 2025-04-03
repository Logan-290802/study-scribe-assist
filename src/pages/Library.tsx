
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Book, FileText, Tag, Calendar, Clock } from 'lucide-react';
import MyWorkList from '@/components/library/MyWorkList';
import KnowledgeBase from '@/components/library/KnowledgeBase';
import { useDocuments } from '@/store/DocumentStore';

const Library = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { knowledgeBaseItems, knowledgeBaseLoading, deleteKnowledgeBaseItem } = useDocuments();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Library</h1>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search documents or references..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="my-work" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="my-work" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>My Work</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span>Knowledge Base</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-work" className="mt-0">
            <MyWorkList searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent value="knowledge-base" className="mt-0">
            <KnowledgeBase 
              searchQuery={searchQuery} 
              items={knowledgeBaseItems} 
              isLoading={knowledgeBaseLoading}
              onDeleteItem={deleteKnowledgeBaseItem}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Library;
