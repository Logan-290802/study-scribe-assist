
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BookOpen, FileText, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  // Sample assignments data
  const assignments = [
    {
      id: 1,
      title: "Literature Review",
      course: "English 301",
      dueDate: "May 15, 2023",
      progress: 75,
      lastEdited: "3 hours ago"
    },
    {
      id: 2,
      title: "Research Paper: Climate Change",
      course: "Environmental Science 202",
      dueDate: "May 22, 2023",
      progress: 45,
      lastEdited: "Yesterday"
    },
    {
      id: 3,
      title: "Historical Analysis Essay",
      course: "History 104",
      dueDate: "May 30, 2023",
      progress: 20,
      lastEdited: "2 days ago"
    },
    {
      id: 4,
      title: "Case Study Analysis",
      course: "Business 405",
      dueDate: "June 5, 2023",
      progress: 10,
      lastEdited: "1 week ago"
    }
  ];

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{assignment.title}</CardTitle>
                <CardDescription>{assignment.course}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>Due: {assignment.dueDate}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>Edited: {assignment.lastEdited}</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${assignment.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-right text-muted-foreground">
                    {assignment.progress}% complete
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full justify-between" size="sm">
                  Continue working 
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
