import api from '../lib/axios';

export interface Organization {
  id: number;
  name: string;
  address?: string;
  contactNumber?: string;
  
  // ADD THESE FIELDS
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'SUSPENDED' | 'EXPIRED';
  subscriptionPlan: string;
  expiresAt?: string; // Dates come as strings from JSON
  isAutoRenew: boolean;
  
  createdAt?: string;
  _count?: {
    users: number;
  };
}

export interface CreateOrgInput {
  name: string;
  address: string;
  contactNumber: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminUsername: string;
  adminPassword?: string;
  // Add these for the "Add" form
  subscriptionStatus?: string;
  expiresAt?: string;
}

export const organizationService = {
  /**
   * GET all organizations (Super Admin only)
   */
  getAll: async (): Promise<Organization[]> => {
    const response = await api.get('/organizations');
    return response.data;
  },

  /**
   * CREATE a new organization and its primary admin
   * This hits the transaction-based controller we created
   */
  create: async (orgData: CreateOrgInput) => {
    const response = await api.post('/organizations', orgData);
    return response.data;
  },

  /**
   * GET organization details by ID
   */
  getById: async (id: number): Promise<Organization> => {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },

  /**
   * UPDATE organization details
   */
  update: async (id: number, orgData: Partial<Organization>) => {
    const response = await api.put(`/organizations/${id}`, orgData);
    return response.data;
  },

  /**
   * DELETE organization (Use with caution!)
   */
  delete: async (id: number) => {
    const response = await api.delete(`/organizations/${id}`);
    return response.data;
  }
};