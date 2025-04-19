
import React from 'react';
import Layout from '@/components/layout/Layout';
import AiApiKeysForm from '@/components/tools/AiApiKeysForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database, Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Tools = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Settings className="h-7 w-7" />
          Tools & Settings
        </h1>
        
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Configuration
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai" className="space-y-6">
            <AiApiKeysForm />
          </TabsContent>
          
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Database settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Tools;
