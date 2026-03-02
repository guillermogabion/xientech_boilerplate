import api from '../lib/axios';

// Interfaces for AI Responses
export interface AiInsightResponse {
  insights: string;
  urgentIds?: number[]
}

export interface AiSummaryResponse {
  summary: string;
}

export interface AiHotspotResponse {
  summary: string;
  stats: {
    summary24h: {
      total: number;
      redPins: number;
      hotspots: Record<string, { redPins: number; total: number }>;
    };
    historicalDailyAverage: string;
  };
}

/**
 * HELPER: Removes "noise" from data to stay under Llama 3.3 70B token limits.
 * Focuses on key fields for the AI to analyze.
 */
const formatSafeData = (data: any[], maxItems: number = 15) => {
  if (!data || !Array.isArray(data)) return [];
  
  return data
    .slice(0, maxItems)
    .map(item => ({
      type: item.incidentType,
      status: item.status,
      detail: item.narrative,
      // PASS THE HEARINGS ARRAY HERE
      hearings: item.hearings?.map((h: any) => ({
        hearingType: h.hearingType,
        actionTaken: h.actionTaken,
        minutes: h.minutes
      })) || []
    }));
};

export const aiService = {
  /**
   * FINANCE: Now accepts appropriations data to analyze
   */
  getFinanceInsights: async (records?: any[]): Promise<AiInsightResponse> => {
    try {
      // If records are provided, clean them; otherwise just hit the endpoint
      const payload = records ? { data: formatSafeData(records) } : {};
      const response = await api.post('/ai/finance-insights', payload);
      return response.data;
    } catch (error) {
      console.error("Error fetching finance insights:", error);
      throw error;
    }
  },

  /**
   * HEALTH: Analyzes clinic visits by sending a thinned-down list
   */
  getHealthTrends: async (profiles?: any[]): Promise<AiInsightResponse> => {
    try {
      const payload = profiles ? { data: formatSafeData(profiles) } : {};
      // Changed to POST to allow sending the data list safely
      const response = await api.post('/ai/health-trends', payload);
      return response.data;
    } catch (error) {
      console.error("Error fetching health trends:", error);
      throw error;
    }
  },

  /**
   * BLOTTER: Summarizes a specific case
   */
  getBlotterSummary: async (incidents: any[]): Promise<AiSummaryResponse> => {
    const cleanedData = formatSafeData(incidents);
    // This sends { data: [...] } to req.body
    const response = await api.post('/ai/blotter-summary', { data: cleanedData }); 
    return response.data;
  },

  getHotspotAnalysis: async (): Promise<AiHotspotResponse> => {
    try {
      const response = await api.get('/ai/hotspot-analysis');
      return response.data;
    } catch (error) {
      console.error("Error fetching hotspot analysis:", error);
      throw error;
    }
  },
  checkClarity: async (text: string): Promise<{ suggestion: string; isClear: boolean }> => {
    const response = await api.post('/ai/check-clarity', { text });
    return response.data;
  }
};