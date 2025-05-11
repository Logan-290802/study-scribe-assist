
import { toast } from '@/components/ui/use-toast';
import { ContentBlockParam } from '@/services/ai/types/claude-types';

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
    
    // Check if file is empty
    if (file.size === 0) {
      reject(new Error('File is empty'));
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        
        // Verify we got actual data
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          reject(new Error('File read resulted in empty buffer'));
          return;
        }
        
        const base64 = btoa(
          new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        // Validate base64 output
        if (!base64 || base64.length < 10) {
          reject(new Error('Base64 conversion produced invalid output'));
          return;
        }
        
        console.log(`File successfully converted to base64. Original size: ${file.size} bytes, Base64 length: ${base64.length}`);
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
    
    // Add a timeout to prevent hanging
    setTimeout(() => {
      if (reader.readyState !== 2) { // DONE state
        reader.abort();
        reject(new Error('File read operation timed out'));
      }
    }, 30000); // 30 second timeout
  });
};

/**
 * Determines if Claude can process the given file type
 * @param file The file to check
 * @returns boolean indicating if the file can be processed
 */
export const isClaudeCompatibleFile = (file: File): boolean => {
  // Claude supports PDFs and images
  if (!file || !file.type) return false;
  
  if (file.type === 'application/pdf') return true;
  if (file.type.startsWith('image/')) return true;
  return false;
};

/**
 * Get the correct Claude API media type based on a file's mime type
 * @param mimeType The mime type of the file
 * @returns The compatible Claude API media type
 */
const getClaudeMediaType = (mimeType: string): string => {
  if (mimeType === 'application/pdf') {
    return 'application/pdf';
  }
  // Handle specific image types
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return 'image/jpeg';
  }
  if (mimeType === 'image/png') {
    return 'image/png';
  }
  if (mimeType === 'image/gif') {
    return 'image/gif';
  }
  if (mimeType === 'image/webp') {
    return 'image/webp';
  }
  
  // Fallback for other image types (less specific but may still work)
  if (mimeType.startsWith('image/')) {
    return 'image/jpeg'; // Use most common format as fallback
  }
  
  // Default fallback (should not reach here due to isClaudeCompatibleFile check)
  return 'application/pdf';
};

/**
 * Creates a message format compatible with Claude's API for file analysis
 */
export const createClaudeFileMessage = (base64: string, mediaType: string, fileName: string, prompt?: string): ContentBlockParam[] => {
  const clMediaType = getClaudeMediaType(mediaType);
  
  // Create the document content block
  const documentBlock: ContentBlockParam = {
    type: 'document',
    source: {
      type: 'base64',
      media_type: clMediaType,
      data: base64
    }
  };

  // Create the prompt content block if provided
  if (prompt) {
    const textBlock: ContentBlockParam = {
      type: 'text',
      text: prompt || `Please analyze this ${fileName} and provide a summary of its contents.`
    };
    
    // Return the array of content blocks
    return [documentBlock, textBlock];
  }
  
  // If no prompt, just return the document with a default prompt
  const defaultTextBlock: ContentBlockParam = {
    type: 'text',
    text: `Please analyze this ${fileName} and provide a summary of its contents.`
  };
  
  return [documentBlock, defaultTextBlock];
};
