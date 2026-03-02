import api from '../lib/axios';
import { Resident } from './residentService';
// 1. Define the Types
export interface LayoutItem {
  label: string;
  x: number;
  y: number;
  fontSize: number;
  isBold: boolean;
  width?: number;  // Add this
  height?: number; // Add 
  fontFamily: string;
  lineHeight: number;
  letterSpacing: number
}

export interface DocumentLayout {
  [key: string]: LayoutItem;
}

export interface DocumentTemplate {
  id: number;
  name: string;
  layoutSettings: DocumentLayout; 
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedTemplates {
  data: DocumentTemplate[];
  total: number;
  pages: number;
}

// 2. Document Service Implementation
export const documentService = {
  // GET all templates (with optional pagination/search)
 getAll: async (page: number, limit: number, search: string) => {
        const res = await api.get(`/documents`, { params: { page, limit, search } });
        return res.data; // This is the object with { data, total, pages }
    },

  // GET one template
  getById: async (id: number): Promise<DocumentTemplate> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // CREATE template
  create: async (data: Omit<DocumentTemplate, 'id'>): Promise<DocumentTemplate> => {
    console.log(data, 'chcek')
    
    const response = await api.post('/documents', data);
    return response.data;
  },

  // UPDATE template
  update: async (id: number, data: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  // DELETE template
  delete: async (id: number) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};


// Bottom of src/services/documentService.ts

/**
 * Helper function to parse the template with real data
 */

export const fillTemplate = (layoutSettings: DocumentLayout, data: any): DocumentLayout => {
  // Deep clone to prevent state mutation
  const processedLayout = JSON.parse(JSON.stringify(layoutSettings));

  Object.keys(processedLayout).forEach((key) => {
    let item = processedLayout[key];

    // Only process text labels, skip logos/images
    if (item.label && typeof item.label === "string" && !key.includes("logo")) {
      // Regex /{{(.*?)}}/g finds all occurrences of {{tag}}
      item.label = item.label.replace(/{{(.*?)}}/g, (match, tag) => {
        const cleanTag = tag.trim(); // Handles {{ fullName }} vs {{fullName}}
        const value = data[cleanTag];

        // If the value exists (even 0 or false), use it. Otherwise, keep the {{tag}}
        return value !== undefined && value !== null ? String(value) : match;
      });
    }
  });

  return processedLayout;
};