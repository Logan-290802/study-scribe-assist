
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle } from 'docx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Reference } from '@/components/ai';

// Initialize pdfMake with the virtual file system for fonts
pdfMake.vfs = (pdfFonts as any).vfs;

export const generateDocx = async (
  title: string,
  content: string,
  references: Reference[],
  aiChatHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<Blob> => {
  // Create document with multiple sections
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title Page
        new Paragraph({
          text: title,
          heading: HeadingLevel.TITLE,
          spacing: { after: 300 },
          alignment: 'center',
        }),
        new Paragraph({
          text: `Submitted on ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`,
          alignment: 'center',
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: 'This submission includes AI-assisted components for transparency and review.',
          italics: true,
          alignment: 'center',
          spacing: { after: 500 },
        }),
        new Paragraph({ text: '', pageBreakBefore: true }),
        
        // Document Content
        new Paragraph({
          text: 'Document Content',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: content.replace(/<[^>]*>/g, '') })],
          spacing: { after: 200 },
        }),
        new Paragraph({ text: '', pageBreakBefore: true }),
        
        // References Section
        new Paragraph({
          text: 'References',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        ...references.map(ref => 
          new Paragraph({
            text: `${ref.authors.join(', ')} (${ref.year}). ${ref.title}. ${ref.source}.${ref.url ? ` Retrieved from ${ref.url}` : ''}`,
            spacing: { after: 100 },
          })
        ),
        new Paragraph({ text: '', pageBreakBefore: true }),
        
        // AI Interaction Log
        new Paragraph({
          text: 'AI Interaction Log',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        ...aiChatHistory.map(msg => 
          new Paragraph({
            text: `[${msg.role === 'user' ? 'User' : 'AI'}]: ${msg.content}`,
            spacing: { after: 100 },
          })
        ),
      ]
    }]
  });

  return await Packer.toBlob(doc);
};

export const generatePdf = async (
  title: string,
  content: string,
  references: Reference[],
  aiChatHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<Blob> => {
  // Get current date for title page
  const submissionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format references for PDF
  const formattedReferences = references.map(ref => ({
    text: `${ref.authors.join(', ')} (${ref.year}). ${ref.title}. ${ref.source}.${ref.url ? ` Retrieved from ${ref.url}` : ''}`,
    margin: [0, 0, 0, 5]
  }));
  
  // Format chat history for PDF
  const formattedChatHistory = aiChatHistory.map(msg => ({
    text: [
      { text: `[${msg.role === 'user' ? 'User' : 'AI'}]: `, bold: true },
      { text: msg.content }
    ],
    margin: [0, 0, 0, 5]
  }));
  
  // Clean HTML tags from content for plain text version
  const cleanContent = content.replace(/<[^>]*>/g, '');
  
  // Create document definition with all sections
  const docDefinition = {
    content: [
      // Title Page
      { 
        text: title, 
        style: 'title',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: submissionDate,
        alignment: 'center',
        margin: [0, 0, 0, 30]
      },
      {
        text: 'This submission includes AI-assisted components for transparency and review.',
        italics: true,
        alignment: 'center',
        margin: [0, 0, 0, 50]
      },
      { text: '', pageBreak: 'before' },
      
      // Document Content
      { text: 'Document Content', style: 'header' },
      { text: cleanContent, margin: [0, 0, 0, 20] },
      { text: '', pageBreak: 'before' },
      
      // References
      { text: 'References', style: 'header' },
      ...formattedReferences,
      { text: '', pageBreak: 'before' },
      
      // AI Interaction Log
      { text: 'AI Interaction Log', style: 'header' },
      ...formattedChatHistory
    ],
    styles: {
      title: {
        fontSize: 24,
        bold: true,
        margin: [0, 20, 0, 20] as [number, number, number, number]
      },
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10] as [number, number, number, number]
      }
    }
  };

  return new Promise((resolve) => {
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob) => {
      resolve(blob);
    });
  });
};
