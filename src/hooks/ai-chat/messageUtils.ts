
import { v4 as uuidv4 } from '@/lib/utils/uuid';
import { ChatMessage, Reference } from '@/components/ai/types';
import { supabase } from '@/lib/supabase';

export const createUserMessage = (content: string): ChatMessage => {
  return {
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: new Date(),
  };
};

export const createReferenceResponse = (): ChatMessage => {
  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: "I found this reference that might be helpful for your research:\n\n**Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive Architecture and Instructional Design: 20 Years Later. Educational Psychology Review, 31(2), 261–292.**\n\nWould you like me to add this to your references list?",
    timestamp: new Date(),
  };
};

export const createSummaryResponse = (): ChatMessage => {
  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: "Based on the literature, here's a summary of key points:\n\n• Cognitive load theory focuses on the limitations of working memory during learning\n• It identifies three types of cognitive load: intrinsic, extraneous, and germane\n• Instructional design should minimize extraneous load and optimize germane load\n• Split-attention and redundancy effects can impair learning efficiency\n• Schema acquisition and automation are key mechanisms for knowledge transfer\n\nWould you like me to elaborate on any of these points?",
    timestamp: new Date(),
  };
};

export const createPdfAnalysisResponse = (fileName: string): ChatMessage => {
  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: `I've analyzed the PDF "${fileName}" and here are the key findings:\n\n• The paper discusses cognitive load theory and its applications in education\n• It emphasizes the importance of managing working memory load during instruction\n• The authors propose a new framework for instructional design based on cognitive architecture\n• There are several practical implications for classroom teaching and online learning\n\nWould you like me to provide more specific details about any of these points or generate a citation for this paper?`,
    timestamp: new Date(),
  };
};

export const createGeneralResponse = (): ChatMessage => {
  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: "I can help you with that. To provide the most relevant assistance, could you specify if you need:\n\n1. Research information on a particular topic\n2. Help with structuring your argument\n3. Citation suggestions for your current paragraph\n4. Feedback on your writing\n\nAlternatively, you could share a specific paragraph you're working on, or upload a PDF for me to analyze.",
    timestamp: new Date(),
  };
};

export const createProcessingPdfMessage = (fileName: string): ChatMessage => {
  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: `I'm analyzing the PDF "${fileName}" now. Give me a moment to process it...`,
    timestamp: new Date(),
  };
};

export const createSampleReference = (): Reference => {
  return {
    id: uuidv4(),
    title: "Cognitive Architecture and Instructional Design: 20 Years Later",
    authors: ["Sweller, J.", "van Merriënboer, J. J. G.", "Paas, F."],
    year: "2019",
    source: "Educational Psychology Review, 31(2), 261–292",
    url: "https://doi.org/10.1007/s10648-019-09465-5",
    format: "APA",
  };
};

export const createReferenceAddedMessage = (): ChatMessage => {
  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: "I've added this reference to your reference list. You can now cite it in your document.",
    timestamp: new Date(),
  };
};

export const saveChatMessageToSupabase = async (message: {
  role: 'user' | 'assistant';
  content: string;
  document_id: string;
  user_id: string;
}, onError: (error: any) => void) => {
  try {
    const { error } = await supabase.from('ai_chat_history').insert({
      ...message,
      timestamp: new Date().toISOString(),
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving chat message:', error);
    onError(error);
  }
};
