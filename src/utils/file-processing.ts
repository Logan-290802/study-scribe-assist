
import { toast } from '@/components/ui/use-toast';

const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32MB - Claude's limit

/**
 * Converts a file to base64 encoding for Claude API
 * @param file The file to convert
 * @returns Promise with base64 string and mediaType
 */
export const fileToBase64 = async (file: File): Promise<{ base64: string; mediaType: string }> => {
  return new Promise((resolve, reject) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File size exceeds the 32MB limit for Claude API`));
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const base64 = btoa(
          new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        resolve({ base64, mediaType: file.type });
      } catch (error) {
        console.error('Error converting file to base64:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };
  });
};

/**
 * Determines if Claude can process the given file type
 * @param file The file to check
 * @returns boolean indicating if the file can be processed
 */
export const isClaudeCompatibleFile = (file: File): boolean => {
  // Claude supports PDFs and images
  if (file.type === 'application/pdf') return true;
  if (file.type.startsWith('image/')) return true;
  return false;
};

/**
 * Creates a message format compatible with Claude's API for file analysis
 */
export const createClaudeFileMessage = (base64: string, mediaType: string, fileName: string, prompt?: string) => {
  // Create the document content block
  const documentBlock = {
    type: 'document' as const,
    source: {
      type: 'base64' as const,
      media_type: mediaType,
      data: base64
    }
  };

  // Create the prompt content block if provided
  const textBlock = prompt ? {
    type: 'text' as const,
    text: prompt || `Please analyze this ${fileName} and provide a summary of its contents.`
  } : null;

  // Return the array of content blocks
  return textBlock ? [documentBlock, textBlock] : [documentBlock];
};
