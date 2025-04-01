
import { v4 as uuidv4 } from '@/lib/utils/uuid';
import { supabase } from '@/lib/supabase';

export const createUserMessage = (content: string) => ({
  id: uuidv4(),
  role: 'user' as const,
  content,
  timestamp: new Date()
});

export const createReferenceResponse = () => ({
  id: uuidv4(),
  role: 'assistant' as const,
  content: 'Based on your query, I found the following references that might be helpful. Would you like to add one of these to your document?\n\n1. Smith, J. (2023). "Advances in AI Research". Journal of Artificial Intelligence, 45(2), 112-145.\n\n2. Johnson, A. & Lee, B. (2022). "Machine Learning Applications in Education". Educational Technology Review, 18(3), 78-92.',
  timestamp: new Date()
});

export const createSummaryResponse = () => ({
  id: uuidv4(),
  role: 'assistant' as const,
  content: 'Here\'s a summary of the key points:\n\n• The main argument centers on how artificial intelligence is transforming research methodologies.\n• Several studies have shown a 35% increase in research efficiency when using AI-assisted tools.\n• However, ethical considerations remain regarding data privacy and potential biases in AI systems.\n• The future direction points toward more transparent and explainable AI systems for academic research.',
  timestamp: new Date()
});

export const createPdfAnalysisResponse = (fileName: string) => ({
  id: uuidv4(),
  role: 'assistant' as const,
  content: `I've analyzed the PDF "${fileName}" and here's what I found:\n\nThis paper discusses recent advances in natural language processing with a focus on large language models. The key findings include:\n\n• Transformer-based models have significantly improved performance on multiple NLP benchmarks\n• The paper identifies three main challenges: computational requirements, ethical considerations, and evaluation metrics\n• The authors propose a new framework for responsible AI development\n\nWould you like me to extract specific information from this document or help you incorporate these findings into your research?`,
  timestamp: new Date()
});

export const createImageAnalysisResponse = (fileName: string) => ({
  id: uuidv4(),
  role: 'assistant' as const,
  content: `I've analyzed the image "${fileName}" and here's what I found:\n\nThis image appears to be a graph/chart showing data related to research findings. Key observations include:\n\n• The graph shows an upward trend in the measured variables over time\n• There are several highlighted data points that seem to represent significant moments or thresholds\n• The color coding suggests multiple variables being tracked simultaneously\n\nWould you like me to help you interpret this data visualization or incorporate it into your research document?`,
  timestamp: new Date()
});

export const createGeneralResponse = () => ({
  id: uuidv4(),
  role: 'assistant' as const,
  content: 'I\'d be happy to help with your research. Based on your question, here are some insights:\n\n• Recent studies in this field have shown promising results, particularly the work by Zhang et al. (2023).\n• The methodological approach you\'re considering has been validated in several peer-reviewed journals.\n• Consider exploring the relationship between variables X and Y, as this has been identified as a gap in the current literature.\n\nWould you like me to provide more specific information on any of these points?',
  timestamp: new Date()
});

export const createProcessingPdfMessage = (fileName: string) => ({
  id: uuidv4(),
  role: 'assistant' as const,
  content: `I'm processing the PDF "${fileName}" now. This will take just a moment...`,
  timestamp: new Date()
});

export const createProcessingImageMessage = (fileName: string) => ({
  id: uuidv4(),
  role: 'assistant' as const,
  content: `I'm analyzing the image "${fileName}" now. This will take just a moment...`,
  timestamp: new Date()
});

export const createSampleReference = () => ({
  id: uuidv4(),
  title: 'Advances in Natural Language Processing for Research Applications',
  authors: ['Smith, J.', 'Johnson, K.'],
  year: '2023',
  source: 'Journal of Artificial Intelligence Research',
  url: 'https://example.com/journal/article/12345',
  format: 'APA' as const,
  content: 'This paper presents a comprehensive overview of how natural language processing techniques can enhance research workflows across various disciplines.'
});

export const createReferenceAddedMessage = () => ({
  id: uuidv4(),
  role: 'assistant' as const,
  content: 'I\'ve added the reference to your document. You can find it in the References panel below the editor.',
  timestamp: new Date()
});

export const saveChatMessageToSupabase = async (
  message: {
    role: 'user' | 'assistant';
    content: string;
    document_id: string;
    user_id: string;
  },
  onError: (error: any) => void
) => {
  try {
    const { error } = await supabase.from('ai_chat_history').insert({
      document_id: message.document_id,
      user_id: message.user_id,
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
    });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving chat message:', error);
    onError(error);
    return false;
  }
};
