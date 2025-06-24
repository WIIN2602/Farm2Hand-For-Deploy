/**
 * Utility functions for text processing and formatting
 */

/**
 * Cleans AI response text by removing markdown formatting symbols
 * @param text - The raw AI response text
 * @returns Cleaned text without markdown symbols
 */
export const cleanAIResponse = (text: string): string => {
  if (!text) return '';
  
  return text
    // Remove bold markdown (**text** or __text__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    
    // Remove italic markdown (*text* or _text_)
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    
    // Remove strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, '$1')
    
    // Remove code blocks (```text``` or `text`)
    .replace(/```[\s\S]*?```/g, (match) => {
      // Extract content between code blocks and remove the backticks
      return match.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
    })
    .replace(/`(.*?)`/g, '$1')
    
    // Remove headers (# ## ### etc.)
    .replace(/^#{1,6}\s+/gm, '')
    
    // Remove list markers (- * +)
    .replace(/^[\s]*[-\*\+]\s+/gm, '• ')
    
    // Remove numbered list markers (1. 2. etc.)
    .replace(/^[\s]*\d+\.\s+/gm, '')
    
    // Remove blockquotes (>)
    .replace(/^>\s+/gm, '')
    
    // Remove horizontal rules (--- or ***)
    .replace(/^[\s]*[-\*]{3,}[\s]*$/gm, '')
    
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Formats text for better readability in chat interface
 * @param text - The text to format
 * @returns Formatted text with proper line breaks and spacing
 */
export const formatChatText = (text: string): string => {
  return cleanAIResponse(text)
    // Ensure proper spacing after periods
    .replace(/\.(?=[A-Z])/g, '. ')
    // Ensure proper spacing after question marks and exclamation marks
    .replace(/[?!](?=[A-Z])/g, '$& ')
    // Clean up multiple spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
};