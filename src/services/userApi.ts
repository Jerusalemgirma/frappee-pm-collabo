import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8006';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making User API request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('User API Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`User API response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error('User API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// User APIs
export const userApi = {
  getAll: () => api.get('/api/resource/User'),
  getById: (id: string) => api.get(`/api/resource/User/${id}`),
  create: (data: any) => api.post('/api/resource/User', data),
  update: (id: string, data: any) => api.put(`/api/resource/User/${id}`, data),
  delete: (id: string) => api.delete(`/api/resource/User/${id}`),
};

// Group APIs
export const groupApi = {
  getAll: () => api.get('/api/resource/Team'),
  getById: (id: string) => api.get(`/api/resource/Team/${id}`),
  create: (data: any) => api.post('/api/resource/Team', data),
  update: (id: string, data: any) => api.put(`/api/resource/Team/${id}`, data),
  delete: (id: string) => api.delete(`/api/resource/Team/${id}`),
};
