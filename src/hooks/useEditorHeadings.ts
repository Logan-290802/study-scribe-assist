
import { useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';

export interface Heading {
  id: string;
  level: number;
  text: string;
}

export const useEditorHeadings = (editor: Editor | null) => {
  const [headings, setHeadings] = useState<Heading[]>([]);

  const updateHeadings = useCallback((editor: Editor) => {
    if (!editor) return;
    
    const headingNodes: Heading[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'heading') {
        const id = `heading-${pos}`;
        headingNodes.push({
          id,
          level: node.attrs.level,
          text: node.textContent
        });
        
        const domNode = document.querySelector(`.ProseMirror .node-${node.type.name}-${pos}`);
        if (domNode) {
          domNode.id = id;
        }
      }
    });
    
    setHeadings(headingNodes);
  }, []);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      if (editor) {
        editor.commands.focus();
      }
    }
  }, [editor]);

  return {
    headings,
    updateHeadings,
    scrollToHeading
  };
};
