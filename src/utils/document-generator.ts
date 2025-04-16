
import { Document, Packer, Paragraph, TextRun } from 'docx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Reference } from '@/components/ai';

// Initialize pdfMake with the virtual file system for fonts
// Using 'any' type for pdfFonts as the type definition is incomplete
pdfMake.vfs = (pdfFonts as any).vfs;

export const generateDocx = async (
  title: string,
  content: string,
  references: Reference[],
  aiChatHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<Blob> => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: title, size: 28, bold: true })],
        }),
        new Paragraph({
          children: [new TextRun({ text: content, size: 24 })],
        }),
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
  // Create document definition with proper type formatting
  const docDefinition = {
    content: [
      { text: title, style: 'header' },
      { text: content }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        // Fix margin to conform to pdfmake's expected format - must be a tuple with specific structure
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
