
import { toast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReferenceFormatterProps {
  format: string;
  title: string;
  authors?: string[];
  year?: string;
  source?: string;
}

export const ReferenceFormatter = ({ format, title, authors, year, source }: ReferenceFormatterProps) => {
  const formatReference = () => {
    switch (format) {
      case 'APA':
        return `${authors?.join(', ')} (${year}). ${title}. ${source}.`;
      case 'MLA':
        return `${authors?.join(', ')}. "${title}." ${source}, ${year}.`;
      case 'Harvard':
        return `${authors?.join(', ')} ${year}, '${title}', ${source}.`;
      default:
        return `${title} - ${authors?.join(', ')} (${year})`;
    }
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(formatReference())
      .then(() => {
        toast({
          title: 'Reference Copied',
          description: 'Reference details copied to clipboard',
        });
      })
      .catch(err => {
        console.error('Could not copy reference: ', err);
        toast({
          title: 'Copy Failed',
          description: 'Unable to copy reference',
          variant: 'destructive',
        });
      });
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleCopyReference}
      className="text-green-500 hover:text-green-700 hover:bg-green-50"
    >
      <Copy className="h-4 w-4 mr-1" />
      Copy
    </Button>
  );
};
