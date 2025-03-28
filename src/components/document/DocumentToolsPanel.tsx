
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReferenceManager from '@/components/references/ReferenceManager';
import ExportPanel from '@/components/export/ExportPanel';
import { Reference } from '@/components/ai/AiChat';

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
  return (
    <Card>
      <CardContent className="p-4">
        <Tabs defaultValue="references" className="w-full">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="references" className="text-base">References ({references.length})</TabsTrigger>
            <TabsTrigger value="export" className="text-base">Export Options</TabsTrigger>
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
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentToolsPanel;
