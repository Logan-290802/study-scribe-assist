
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { FileText, Upload, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useDocuments } from '@/store/DocumentStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { documents, addDocument } = useDocuments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [moduleNumber, setModuleNumber] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);

  const handleCreateAssignment = () => {
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your assignment.",
        variant: "destructive",
      });
      return;
    }

    // Add the new document to our store
    const newDocumentId = addDocument({
      title,
      moduleNumber,
      dueDate,
      snippet: `A new assignment about ${title}`,
      referencesCount: 0,
      content: ''
    });

    toast({
      title: "Assignment created",
      description: "Your new assignment has been created successfully.",
    });

    // Close the dialog and reset form
    setIsDialogOpen(false);
    setTitle('');
    setModuleNumber('');
    setDueDate(undefined);
    setFile(null);

    // Navigate to document editor with the new ID
    navigate(`/documents/${newDocumentId}`);
  };

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
          <Button className="mt-4 md:mt-0" onClick={handleCreateAssignment}>
            <FileText className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        </div>

        {documents.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No assignments yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new assignment
            </p>
            <Button className="mt-4" onClick={handleCreateAssignment}>
              <FileText className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <h3 className="font-medium text-lg line-clamp-1 mb-2">{doc.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{doc.snippet}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <div>Last modified: {format(doc.lastModified, 'PPP')}</div>
                  {doc.dueDate && <div>Due: {format(doc.dueDate, 'PPP')}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Project Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Literature Review"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="module" className="text-right">
                Module Number
              </Label>
              <Input
                id="module"
                value={moduleNumber}
                onChange={(e) => setModuleNumber(e.target.value)}
                className="col-span-3"
                placeholder="e.g. MOD101"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                Assessment Brief
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="file"
                    className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors w-full"
                  >
                    <Upload className="h-4 w-4" />
                    {file ? file.name : "Upload document"}
                  </Label>
                  {file && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="h-9 px-2"
                    >
                      ✕
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your assessment brief document (PDF, Word, etc.)
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;
