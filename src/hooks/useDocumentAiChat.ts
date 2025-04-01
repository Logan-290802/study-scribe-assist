
import { useToast } from '@/components/ui/use-toast';
import { useChatHistory } from './useChatHistory';
import { processAiAction, buildUserQuery, getActionTitle } from '@/utils/chat/aiActionUtils';

export const useDocumentAiChat = (documentId: string | undefined, userId: string | undefined) => {
  const { toast } = useToast();
  const { chatHistory, setChatHistory, addMessageToHistory } = useChatHistory(documentId, userId);

  // This function is now only called when the ChatInput component sends the message
  // The TextSelectionMenu only populates the input field but doesn't trigger this directly
  const handleAiAction = async (action: string, selection: string) => {
    if (!selection.trim()) {
      toast({
        title: `No text selected`,
        description: `Please select some text first to perform this action.`,
        duration: 3000,
      });
      return;
    }

    // Build the user query based on the action and selection
    const userQuery = buildUserQuery(action, selection);
    
    // Add user message to history
    await addMessageToHistory('user', userQuery);
    
    // Show toast notification for action in progress
    toast({
      title: getActionTitle(action),
      description: `Processing your ${action} request for the selected text.`,
      duration: 3000,
    });
    
    // Process the AI action and get the response
    const { content: aiResponseContent } = await processAiAction(selection, action);
    
    // Add AI response to chat history
    await addMessageToHistory('assistant', aiResponseContent);
  };

  return {
    aiChatHistory: chatHistory,
    setAiChatHistory: setChatHistory,
    handleAiAction
  };
};
