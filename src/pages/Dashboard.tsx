
import React from 'react';
import Layout from '@/components/layout/Layout';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to StudyScribe</h1>
            <p className="text-muted-foreground mt-2">
              Your AI-powered academic writing assistant
            </p>
          </div>
          <Button className="mt-4 md:mt-0">
            <FileText className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-lg py-16 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No assignments yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new assignment
          </p>
          <Button className="mt-4">
            <FileText className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
