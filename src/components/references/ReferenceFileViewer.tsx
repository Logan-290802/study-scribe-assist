
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface ReferenceFileViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl?: string | null;
}

export const ReferenceFileViewer: React.FC<ReferenceFileViewerProps> = ({
  open,
  onOpenChange,
  fileUrl,
}) => {
  if (!fileUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        {fileUrl && (
          <div className="w-full h-full">
            <object
              data={fileUrl}
              type="application/pdf"
              className="w-full h-full"
            >
              <div className="flex items-center justify-center h-full">
                <p>Unable to display PDF. <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Download instead</a></p>
              </div>
            </object>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
