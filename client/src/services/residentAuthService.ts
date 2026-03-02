import api from '../lib/axios';


export interface ResidentAuth {
    id: number;
    firstName: string;
    lastName: string;
    status: string;
}

export const residentAuthService = {
    login: async (credentials: any) => {
        const response = await api.post(`/resident-auth/resident-login`, credentials)
        return response.data;
    },

    activateAccount: async (data: { residentId: number; email: string; password: string }) => {
        try {
        // Ensure the endpoint matches your backend route (e.g., /residents/activate)
        const response = await api.post('/resident-auth/activate', data);
        
        // If your backend returns a new token or updated user info, 
        // you can handle it here.
        return response.data;
        } catch (error) {
        throw error;
        }
    },
};  