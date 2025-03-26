
import Heading from '@tiptap/extension-heading';

export const HeadingWithId = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];
    
    // Add a unique ID to each heading based on its position and content
    HTMLAttributes.id = `heading-${HTMLAttributes.class?.split('node-')[1] || Math.random().toString(36).substring(2, 9)}`;
    
    return [`h${level}`, HTMLAttributes, 0];
  }
});
