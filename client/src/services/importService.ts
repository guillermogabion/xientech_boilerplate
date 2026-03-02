import api from '../lib/axios';

export interface ImportReport {
  success: number;
  failed: number;
  errors: string[];
}

export const importService = {
  /**
   * Sends CSV data and mapping to the backend.
   * The organizationId is handled by the backend via the Auth Token.
   */
  bulkImportResidents: async (csvData: any[], mapping: any): Promise<ImportReport> => {
    try {
      // We no longer need to pass organizationId here
      const response = await api.post('/import', {
        csvData,
        mapping
      });
      
      return response.data;
    } catch (error: any) {
      console.error("Import Service Error:", error);
      // Ensure we pass back the specific error message from the server
      throw error.response?.data || new Error("Failed to process import");
    }
  }
};