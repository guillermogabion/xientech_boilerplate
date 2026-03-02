import api from '../lib/axios';

export interface Resident {
  id: number;
  pic: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  nationalIdNumber: string;
  gender: string;
  birthDate: string;
  civilStatus: string;
  phoneNumber: string;
  isIndigent: Boolean;
  isHead: Boolean;
  isVoter: Boolean;
  isDeleted: Boolean;
  isSeniorCitizen: Boolean;
  createdAt?: string;
  household?: {
    id: number;
    household_no: string;
    purok?: {
      id: number;
      name: string; // This is the Purok Name you want
    };
    street?: {
      name: string;
    }
  };
}

export interface PaginatedResidents {
  data: Resident[];
  total: number;
  pages: number;
  currentPage: number;
}

export interface ResidentAutocomplete {
  id: number;
  fullName: string;
  details: string;
  location: string;
  hasProfile: boolean;
  birthDate: string;
}

export interface BenefitItem {
  name: string;
}
export interface BenefitLayout {
   [key: string]: BenefitItem;
}



export interface Household {
  id: number;
  household_no: string;
  purok: string;
  street: string;
  is4Ps: Boolean;
  householdId4Ps: string;
  isIndigent: Boolean;
  otherBenefits: JSON;
}

export const residentService = {
  // GET all users
//   getAll: async (): Promise<User[]> => {
//     const response = await api.get('/users');
//     return response.data;
//   },
    getAll: async (page: number, limit: number, search: string) => {
        const res = await api.get(`/residents`, { params: { page, limit, search } });
        return res.data; // This is the object with { data, total, pages }
    },

  

  // GET one user
  getById: async (id: number): Promise<Resident> => {
    const response = await api.get(`/residents/${id}`);
    return response.data;
  },

  // CREATE user
  create: async (residentData: Omit<Resident, 'id'>) => {

    // return console.log(residentData, 'test');
    const response = await api.post('/residents', residentData);
    return response.data;
  },

  // UPDATE user
  update: async (id: number, residentData: Partial<Resident>) => {
    const response = await api.put(`/residents/${id}`, residentData);
    return response.data;
  },

  // DELETE user
  delete: async (id: number) => {
    const response = await api.delete(`/residents/${id}`);
    return response.data;
  },

  getAnalytics: async (): Promise<any> => {
    const response = await api.get(`/residents/analytics/stats`);
    return response.data;
  },


  getAutocomplete: async (search: string): Promise<ResidentAutocomplete[]> => {
    const response = await api.get('/residents/autocomplete', { 
      params: { search } 
    });
    return response.data;
  },


  exportExcel: async (filters: any) => {
      const response = await api.get("/residents/export", {
          params: filters, // Axios will turn { isVoter: true } into ?isVoter=true
          responseType: 'blob', 
      });
      return response.data;
  }

};
