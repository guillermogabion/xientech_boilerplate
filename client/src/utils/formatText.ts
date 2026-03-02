// src/utils/formatText.ts

export const formatEnum = (text: any): string => {
  // Check if text is null, undefined, or not a string
  if (!text || typeof text !== 'string') {
    return ""; 
  }

  return text
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};