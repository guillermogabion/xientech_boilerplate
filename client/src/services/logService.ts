import api from '../lib/axios';

export interface AuditLog {
  id: number;
  action: string;
  module: string;
  details: string;
  ipAddress: string | null;
  userId: number | null;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface PaginatedLogs {
  success: boolean;
  data: AuditLog[];
  total: number;
  pages: number;
  currentPage: number;
}

export const logService = {
  /**
   * GET paginated system logs
   * @param page - Current page number
   * @param limit - Number of items per page
   * @param search - Search string (action, details, user name)
   * @param module - Optional filter by specific module (PUROK, BLOTTER, etc.)
   */
  getAll: async (
    page: number = 1, 
    limit: number = 15, 
    search: string = "", 
    module: string = ""
  ): Promise<PaginatedLogs> => {
    const res = await api.get(`/logs`, { 
      params: { page, limit, search, module } 
    });
    return res.data;
  },

  /**
   * GET log details by ID (Optional, if you have a detail view)
   */
  getById: async (id: number): Promise<AuditLog> => {
    const response = await api.get(`/logs/${id}`);
    return response.data;
  }
};