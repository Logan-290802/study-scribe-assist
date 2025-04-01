
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReferenceManager from '@/components/references/ReferenceManager';
import ExportPanel from '@/components/export/ExportPanel';
import AiApiKeysForm from '@/components/tools/AiApiKeysForm';
import { Reference } from '@/components/ai';
import { Settings } from 'lucide-react';
import { aiServiceManager } from '@/services/ai/AiServiceManager';

interface DocumentToolsPanelProps {
  references: Reference[];
  documentTitle: string;
  documentContent: string;
  aiChatHistory: { role: 'user' | 'assistant'; content: string }[];
  onAddReference: (reference: Reference) => void;
  onDeleteReference: (id: string) => void;
}

const DocumentToolsPanel: React.FC<DocumentToolsPanelProps> = ({
  references,
  documentTitle,
  documentContent,
  aiChatHistory,
  onAddReference,
  onDeleteReference
}) => {
  const [apiKeys, setApiKeys] = useState<{ 
    perplexity?: string; 
    openai?: string; 
    claude?: string 
  }>({});
  
  // Load saved API keys from localStorage on mount
  useEffect(() => {
    const perplexityKey = localStorage.getItem('perplexity_api_key');
    const openaiKey = localStorage.getItem('openai_api_key');
    const claudeKey = localStorage.getItem('claude_api_key');
    
    const savedKeys = {
      perplexity: perplexityKey || undefined,
      openai: openaiKey || undefined,
      claude: claudeKey || undefined
    };
    
    setApiKeys(savedKeys);
    
    // Update the AI service manager with the keys
    // This is a singleton instance that will be used throughout the app
    const manager = (aiServiceManager as any);
    if (manager && typeof manager.constructor === 'function') {
      // Reinitialize with the saved keys
      Object.assign(manager, new manager.constructor(savedKeys));
    }
  }, []);
  
  const handleApiKeysUpdate = (newKeys: { 
    perplexity?: string; 
    openai?: string; 
    claude?: string 
  }) => {
    setApiKeys(newKeys);
    
    // Update the AI service manager with the new keys
    const manager = (aiServiceManager as any);
    if (manager && typeof manager.constructor === 'function') {
      // Reinitialize with the new keys
      Object.assign(manager, new manager.constructor(newKeys));
    }
  };

  return (
    <Card className="mb-40">
      <CardContent className="p-4">
        <Tabs defaultValue="references" className="w-full">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="references" className="text-base">References ({references.length})</TabsTrigger>
            <TabsTrigger value="export" className="text-base">Export Options</TabsTrigger>
            <TabsTrigger value="ai-settings" className="text-base flex items-center gap-1">
              <Settings className="h-4 w-4" />
              AI Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="references" className="mt-0">
            <ReferenceManager
              references={references}
              onAddReference={onAddReference}
              onDeleteReference={onDeleteReference}
            />
          </TabsContent>
          
          <TabsContent value="export" className="mt-0">
            <ExportPanel 
              documentTitle={documentTitle}
              documentContent={documentContent}
              references={references}
              aiChatHistory={aiChatHistory}
            />
          </TabsContent>
          
          <TabsContent value="ai-settings" className="mt-0">
            <AiApiKeysForm 
              initialKeys={apiKeys}
              onKeysUpdate={handleApiKeysUpdate}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentToolsPanel;
