
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Check, AlertTriangle, BookOpen, FileSearch, Sparkles, Bot } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Tools = () => {
  const [grammarlyEnabled, setGrammarlyEnabled] = useState(false);
  const [plagiarismEnabled, setPlagiarismEnabled] = useState(false);
  const [readabilityEnabled, setReadabilityEnabled] = useState(false);
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Writing Tools</h1>
        </div>
        
        <Tabs defaultValue="ai-tools" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="writing" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              <span>Writing Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="plagiarism" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              <span>Plagiarism Checker</span>
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>AI Tools</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="writing" className="mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Grammarly Integration
                  </CardTitle>
                  <CardDescription>
                    Real-time grammar, spelling, and style suggestions for your academic writing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="grammarly-toggle" className="font-medium">Enable Grammarly</Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Get real-time grammar and style suggestions as you write.
                      </p>
                    </div>
                    <Switch 
                      id="grammarly-toggle" 
                      checked={grammarlyEnabled} 
                      onCheckedChange={setGrammarlyEnabled}
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 text-sm text-gray-500">
                  {grammarlyEnabled ? 
                    "Grammarly is currently active on all document editors." : 
                    "Grammarly is currently disabled."}
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Readability Checker
                  </CardTitle>
                  <CardDescription>
                    Analyze your text for readability and academic writing style.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="readability-toggle" className="font-medium">Enable Readability Checker</Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Get feedback on clarity, conciseness, and academic writing style.
                      </p>
                    </div>
                    <Switch 
                      id="readability-toggle" 
                      checked={readabilityEnabled} 
                      onCheckedChange={setReadabilityEnabled}
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 text-sm text-gray-500">
                  {readabilityEnabled ? 
                    "Readability analysis is enabled." : 
                    "Readability analysis is currently disabled."}
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="plagiarism" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Plagiarism Checker
                </CardTitle>
                <CardDescription>
                  Check your document for potential plagiarism and proper citation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="plagiarism-toggle" className="font-medium">Enable Plagiarism Checking</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Automatically check your document for uncited content and proper references.
                    </p>
                  </div>
                  <Switch 
                    id="plagiarism-toggle" 
                    checked={plagiarismEnabled} 
                    onCheckedChange={setPlagiarismEnabled}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 text-sm text-gray-500">
                {plagiarismEnabled ? 
                  "Plagiarism checking is currently active." : 
                  "Plagiarism checking is currently disabled."}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai-tools" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  AI Research Assistant
                </CardTitle>
                <CardDescription>
                  Get AI-powered research help, writing suggestions, and idea development with our integrated Claude assistant.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">AI Research Assistant is active</p>
                    <p className="text-sm text-blue-700 mt-1">
                      The AI Research Assistant is available in your documents to help with research, brainstorming, and academic writing.
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto"
                >
                  Go to Documents
                </Button>
              </CardContent>
              <CardFooter className="text-sm text-gray-500 border-t pt-4">
                Powered by Anthropic Claude AI
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Tools;
