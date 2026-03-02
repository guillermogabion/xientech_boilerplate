import api from '../lib/axios';

export interface User {
  id: number;
  pic: string;
  username: string;
  password?: string; // Optional because we don't always fetch/send it
  firstName: string;
  lastName: string;
  email: string,
  role: string;
  designation?: string[];
  createdAt?: string;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  pages: number;
  currentPage: number;
}

interface ServiceRequest {
  title: string;
  certType: string;
  residentId: number;
}
export const userService = {
  // GET all users
//   getAll: async (): Promise<User[]> => {
//     const response = await api.get('/users');
//     return response.data;
//   },
    getAll: async (page: number, limit: number, search: string) => {
        const res = await api.get(`/users`, { params: { page, limit, search } });
        return res.data; // This is the object with { data, total, pages }
    },

  

  // GET one user
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // CREATE user
  create: async (userData: Omit<User, 'id'>) => {

    // return console.log(userData, 'test');
    const response = await api.post('/users', userData);
    return response.data;
  },

  // UPDATE user
  update: async (id: number, userData: Partial<User>) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // DELETE user
  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getAllList: async (): Promise<{ success: boolean; data: User[] }> => {
    const response = await api.get('/users/all');
    return response.data; // This returns the whole object: { success, data }
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post(`/users/reset-password/${token}`, { password });
    return response.data;
  },


  createRequest: async ( requestData: ServiceRequest) => {
    const response = await api.post(`users/send-request`, requestData);
    return response.data
  },
  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  checkAdminStatus: async () => {
    const res = await api.get('/users/isAdminExist');
    return res.data; // { exists: true/false }
  },
};