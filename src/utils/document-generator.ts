
import { Document, Packer, Paragraph, TextRun } from 'docx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Reference } from '@/components/ai';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
  const docDefinition = {
    content: [
      { text: title, style: 'header' },
      content,
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
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
