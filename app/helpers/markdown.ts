export function convertMarkdownToPlainText(markdown: string) {
    if (!markdown) return '';
  
    let text = markdown;
  
    // Remove headers
    text = text.replace(/#+\s*(.*)/g, '$1');
  
    // Remove bold and italic
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
    text = text.replace(/(\*|_)(.*?)\1/g, '$2');
  
    // Replace links with just the link text
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
    // Replace list items with a dash and space
    text = text.replace(/^(\s*)?(\-|\+|\*|\d+\.)\s+/gm, '$1- ');
  
    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`([^`]+)`/g, '$1');
  
    // Remove blockquotes
    text = text.replace(/^\s*>\s*/gm, '');
  
    // Remove horizontal rules
    text = text.replace(/^\s*[-*_]{3,}\s*$/gm, '');
  
    // Remove extra newlines
    text = text.replace(/\n{3,}/g, '\n\n');
  
    return text.trim();
  }

