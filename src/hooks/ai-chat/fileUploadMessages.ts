
import { ChatMessage } from '@/components/ai/types';
import { aiServiceManager } from '@/services/ai/AiServiceManager';
import { toast } from '@/components/ui/use-toast';
import { isClaudeCompatibleFile } from '@/utils/file-processing';

export const createFileUploadMessages = async (
  file: File,
  documentId?: string,
  userId?: string,
  setMessages?: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Create initial user message about uploading
  const userMessage: ChatMessage = {
    id: Math.random().toString(36).substring(2, 9),
    role: 'user',
    content: `I've uploaded a file: ${file.name}`,
    timestamp: new Date()
  };

  // Function to add the user message to the chat history
  const addUserMessage = () => {
    if (setMessages) {
      setMessages(prev => [...prev, userMessage]);
    }
  };

  // Error message function 
  const getErrorMessage = (errorDescription: string, actionNeeded: string = "") => {
    const errorMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'assistant',
      content: `There was a problem processing your file: ${errorDescription} ${actionNeeded}`,
      timestamp: new Date()
    };
    
    if (setMessages) {
      setMessages(prev => [...prev, errorMessage]);
      if (setIsLoading) setIsLoading(false);
    }
    
    return errorMessage;
  };

  // Function to analyze file with Claude and add response
  const addProcessingAndAnalysisMessages = async () => {
    try {
      // Add a processing message
      const processingMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: `I'm analyzing your file: ${file.name}...`,
        timestamp: new Date()
      };
      
      if (setMessages) {
        setMessages(prev => [...prev, processingMessage]);
      }

      // Check file compatibility before sending
      if (!isClaudeCompatibleFile(file)) {
        console.warn(`File type not compatible with Claude analysis: ${file.type}`);
        const errorMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: `I'm sorry, but I can only analyze PDF documents and images. Your file (${file.type}) isn't in a format I can process. Please try uploading a PDF or image file instead.`,
          timestamp: new Date()
        };
        
        if (setMessages) {
          setMessages(prev => prev.map(msg => 
            msg.id === processingMessage.id ? errorMessage : msg
          ));
          
          if (setIsLoading) setIsLoading(false);
        }
        
        return errorMessage;
      }

      // Get actual analysis from Claude
      const prompt = `Please analyze this file (${file.name}) and provide useful insights and a summary of its contents. If it's a research paper or article, extract key findings and methodology.`;
      
      console.log('Sending file for analysis:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
      
      const aiResult = await aiServiceManager.processFileWithAi(file, prompt);
      
      console.log('Received analysis result:', {
        success: !aiResult.error,
        errorPresent: !!aiResult.error,
        contentLength: aiResult.content.length
      });
      
      if (aiResult.error) {
        console.error('Error in file analysis:', aiResult.error);
        const errorMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: aiResult.content || `I encountered a problem analyzing your file. Please try again or upload a different file.`,
          timestamp: new Date()
        };
        
        if (setMessages) {
          setMessages(prev => prev.map(msg => 
            msg.id === processingMessage.id ? errorMessage : msg
          ));
          
          if (setIsLoading) setIsLoading(false);
        }
        
        return errorMessage;
      }
      
      // Replace processing message with actual analysis
      const analysisMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: aiResult.content,
        timestamp: new Date()
      };
      
      if (setMessages) {
        // Replace the processing message with the analysis
        setMessages(prev => prev.map(msg => 
          msg.id === processingMessage.id ? analysisMessage : msg
        ));
        
        if (setIsLoading) setIsLoading(false);
      }
      
      return analysisMessage;
    } catch (error) {
      console.error('Error in file analysis:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      return getErrorMessage(`Failed to analyze the file. ${errorMsg}`);
    }
  };

  return {
    userMessage,
    addUserMessage,
    getErrorMessage,
    addProcessingAndAnalysisMessages
  };
};
