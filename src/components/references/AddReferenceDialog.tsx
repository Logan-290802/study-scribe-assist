import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Reference } from '@/components/ai';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookPlus, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const referenceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  authors: z.string().min(1, "At least one author is required"),
  year: z.string().min(1, "Year is required"),
  source: z.string().min(1, "Source is required"),
  url: z.string().url().optional().or(z.literal('')),
  format: z.enum(["APA", "MLA", "Harvard"]),
});

type ReferenceFormValues = z.infer<typeof referenceFormSchema>;

interface AddReferenceDialogProps {
  onAddReference: (reference: Reference) => void;
}

export function AddReferenceDialog({ onAddReference }: AddReferenceDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const { toast } = useToast();
  
  const form = useForm<ReferenceFormValues>({
    resolver: zodResolver(referenceFormSchema),
    defaultValues: {
      title: '',
      authors: '',
      year: new Date().getFullYear().toString(),
      source: '',
      url: '',
      format: 'APA',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  async function onSubmit(data: ReferenceFormValues) {
    setIsUploading(true);
    try {
      let filePath: string | undefined;

      if (selectedFile) {
        const fileName = `${Date.now()}_${selectedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('reference-pdfs')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;
        filePath = uploadData.path;
      }

      const reference: Reference = {
        id: Date.now().toString(),
        title: data.title,
        authors: data.authors.split(',').map(author => author.trim()),
        year: data.year,
        source: data.source,
        url: data.url || undefined,
        format: data.format,
        file_path: filePath,
      };
      
      onAddReference(reference);
      form.reset();
      setSelectedFile(null);
      setOpen(false);
    } catch (error) {
      console.error('Error adding reference:', error);
      toast({
        title: "Error",
        description: "Failed to add reference. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full py-1.5 flex justify-center items-center gap-1 text-sm bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <BookPlus className="w-4 h-4" />
          Add Reference Manually
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Reference</DialogTitle>
          <DialogDescription>
            Fill in the details of your reference. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the title of the work" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authors * (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Smith, J., Johnson, A." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year *</FormLabel>
                    <FormControl>
                      <Input placeholder="Publication year" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Citation Format *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="APA">APA</SelectItem>
                        <SelectItem value="MLA">MLA</SelectItem>
                        <SelectItem value="Harvard">Harvard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source *</FormLabel>
                  <FormControl>
                    <Input placeholder="Journal name, book publisher, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>PDF File (optional)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {selectedFile && (
                    <span className="text-sm text-gray-500">{selectedFile.name}</span>
                  )}
                </div>
              </FormControl>
            </FormItem>
            <DialogFooter>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Add Reference'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
