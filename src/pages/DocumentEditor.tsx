
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import TextEditor from '@/components/editor/TextEditor';
import AiChat, { Reference } from '@/components/ai/AiChat';
import DocumentTitle from '@/components/editor/DocumentTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

// Sample data - in a real app, this would come from a database
const sampleAssignments = {
  "1": {
    title: "Literature Review",
    course: "English 301",
    content: "<h1>Literature Review</h1><p>This is a review of the literature on cognitive load theory and its applications in education.</p><p>Start by introducing the key concepts...</p>",
    references: []
  },
  "2": {
    title: "Research Paper: Climate Change",
    course: "Environmental Science 202",
    content: "<h1>Climate Change Research</h1><p>This paper examines the current evidence for anthropogenic climate change and evaluates potential mitigation strategies.</p>",
    references: []
  },
  "3": {
    title: "Historical Analysis Essay",
    course: "History 104",
    content: "<h1>Historical Analysis</h1><p>In this essay, we will analyze the causes and consequences of the Industrial Revolution in Britain.</p>",
    references: []
  },
  "4": {
    title: "Case Study Analysis",
    course: "Business 405",
    content: "<h1>Business Case Study</h1><p>This case study examines the strategic decisions made by Company X during its expansion into international markets.</p>",
    references: []
  }
};

const DocumentEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get the assignment data based on the ID
  const assignment = id ? sampleAssignments[id as keyof typeof sampleAssignments] : null;

  const [documentTitle, setDocumentTitle] = useState(assignment?.title || 'Untitled Document');
  const [documentContent, setDocumentContent] = useState(assignment?.content || '');
  const [references, setReferences] = useState<Reference[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const handleSave = () => {
    toast({
      title: "Document saved",
      description: "Your document has been saved successfully.",
    });
  };

  const handleComplete = () => {
    setIsCompleted(true);
    toast({
      title: "Document completed",
      description: "Your document has been marked as completed.",
      variant: "default",
    });
  };

  const handleAiAction = (action: 'research' | 'expand' | 'critique', selectedText: string) => {
    // This function is passed to TextEditor and will be called when the user
    // selects text and chooses an AI action
    console.log(`AI action: ${action} on "${selectedText}"`);
  };

  const handleAddReference = (reference: Reference) => {
    setReferences(prev => [...prev, reference]);
  };

  if (!assignment) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold mb-4">Document not found</h1>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSave} 
              size="sm"
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DocumentTitle 
              title={documentTitle} 
              onTitleChange={setDocumentTitle} 
            />
            {isCompleted && (
              <span className="inline-flex items-center text-sm text-green-600 font-medium">
                <CheckCircle className="h-4 w-4 mr-1" /> Completed
              </span>
            )}
          </div>
          <Button 
            onClick={handleComplete} 
            size="sm"
            variant="default"
            disabled={isCompleted}
            className={isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isCompleted ? "Completed" : "Complete"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{assignment.course}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="editor" className="w-full">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="references">References ({references.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="mt-2">
                <div className="h-[calc(100vh-240px)]">
                  <TextEditor
                    content={documentContent}
                    onChange={setDocumentContent}
                    onAiAction={handleAiAction}
                  />
                </div>
              </TabsContent>
              <TabsContent value="references" className="mt-2">
                <div className="h-[calc(100vh-240px)] overflow-y-auto border rounded-md p-4">
                  {references.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No references added yet.</p>
                      <p className="text-sm mt-2">Use the AI Assistant to add references to your document.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {references.map((ref) => (
                        <div key={ref.id} className="p-3 border rounded-md">
                          <h3 className="font-medium">{ref.title}</h3>
                          <p className="text-sm">{ref.authors.join(', ')} ({ref.year})</p>
                          <p className="text-sm text-muted-foreground">{ref.source}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="h-[calc(100vh-240px)]">
            <AiChat onAddReference={handleAddReference} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentEditor;
