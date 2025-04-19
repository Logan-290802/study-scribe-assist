
import { getAiServiceManager } from '@/services/ai/AiServiceManager';
import { toast } from '@/components/ui/use-toast';

export const getActionTitle = (action: string) => {
  const actionTitles: Record<string, string> = {
    'research': 'Researching topic',
    'critique': 'Analyzing writing',
    'expand': 'Developing concept'
  };
  
  return actionTitles[action] || `AI ${action} in progress...`;
};

export const getSuccessTitle = (action: string) => {
  const successTitles: Record<string, string> = {
    'research': 'Research complete',
    'critique': 'Analysis complete',
    'expand': 'Concept developed'
  };
  
  return successTitles[action] || `${action.charAt(0).toUpperCase() + action.slice(1)} complete`;
};

export const formatAiResponse = (action: string, aiResult: { content: string; source?: string }) => {
  let responsePrefix = '';
  switch (action) {
    case 'research':
      responsePrefix = '📚 **Research Findings**\n\n';
      break;
    case 'critique':
      responsePrefix = '🧐 **Writing Analysis**\n\n';
      break;
    case 'expand':
      responsePrefix = '✨ **Concept Development**\n\n';
      break;
    default:
      responsePrefix = '';
  }
  
  return `${responsePrefix}${aiResult.content}${aiResult.source ? `\n\n*Source: ${aiResult.source}*` : ''}`;
};

export const getAiActionType = (action: string): 'research' | 'critique' | 'expand' => {
  switch (action) {
    case 'research':
      return 'research';
    case 'critique':
      return 'critique';
    case 'expand':
      return 'expand';
    default:
      return 'research';
  }
};

export const processAiAction = async (
  selection: string, 
  action: string
) => {
  try {
    const aiAction = getAiActionType(action);
    
    // Get the AI service manager instance
    const aiManager = await getAiServiceManager();
    
    // Process the AI action
    const aiResult = await aiManager.processTextWithAi(selection, aiAction);
    const formattedResponse = formatAiResponse(action, aiResult);
    
    toast({
      title: getSuccessTitle(action),
      description: 'Your AI assistant has processed your request.',
      duration: 3000,
    });
    
    return { content: formattedResponse, success: true };
  } catch (error) {
    console.error(`Error during AI ${action}:`, error);
    
    toast({
      title: 'Error',
      description: `Failed to process your ${action} request.`,
      variant: 'destructive',
      duration: 3000,
    });
    
    return { 
      content: `I encountered an error while processing your ${action} request. Please try again later.`,
      success: false 
    };
  }
};

export const buildUserQuery = (action: string, selection: string) => {
  switch (action) {
    case 'research':
      return `Find scholarly information about "${selection}". Include key concepts, historical context, and relevant research.`;
    case 'critique':
      return `Evaluate this text for clarity, logic, and effectiveness: "${selection}". Identify strengths and weaknesses, and suggest specific improvements.`;
    case 'expand':
      return `Develop and elaborate on this idea: "${selection}". Provide deeper context, examples, and related concepts.`;
    default:
      return `Please ${action} the following text: "${selection}"`;
  }
};
