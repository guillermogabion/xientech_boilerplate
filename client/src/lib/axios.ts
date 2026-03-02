import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:5000/api', // local 
  // baseURL: 'http://10.207.237.236:5000/api', // local 
  baseURL: 'https://ocr-backend-gilt.vercel.app/api', // local 
  // baseURL: 'https://brgymanagementsystem.vercel.app/api', // prod
  // baseURL: 'https://xientech-api.vercel.app/api', // prod
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true // uncomment for prod
});

// ADD THIS INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get the token saved during login
    if (token) {
      // Attach the token to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// OPTIONAL: Global error handler for "Token Expired"
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. CHECK IF OFFLINE FIRST
    if (!navigator.onLine || error.message === 'Network Error') {
      console.warn("User is offline. Skipping token removal.");
      // Do NOT remove token, just return the error so the UI can show "Saved Offline"
      return Promise.reject(error);
    }

    const isPublicRoute = 
  error.config.url.includes('/users/signin') || 
  error.config.url.includes('/resident-login') || 
  error.config.url.includes('/users/isAdminExist');

    // 2. ONLY REMOVE TOKEN IF SERVER EXPLICITLY SAYS 401 (Security Issue)
    if (error.response && error.response.status === 401 && !isPublicRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/resident-') || currentPath.startsWith('/request')) {
        window.location.href = '/resident-login';
      } else {
        window.location.href = '/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;