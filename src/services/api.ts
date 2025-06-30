import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8006';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Epic APIs
export const epicApi = {
  getAll: () => api.get('/api/resource/Epic?fields=["name","description","status"]'),
  getById: (id: string) => api.get(`/api/resource/Epic/${id}`),
  create: (data: any) => api.post('/api/resource/Epic', data),
  update: (id: string, data: any) => api.put(`/api/resource/Epic/${id}`, data),
  delete: (id: string) => api.delete(`/api/resource/Epic/${id}`),
};

// Project APIs
export const projectApi = {
  getAll: () => api.get('/api/resource/Project?fields=["name","description","status"]'),
  getById: (id: string) => api.get(`/api/resource/Project/${id}`),
  create: (data: any) => api.post('/api/resource/Project', data),
  update: (id: string, data: any) => api.put(`/api/resource/Project/${id}`, data),
  delete: (id: string) => api.delete(`/api/resource/Project/${id}`),
};

// Task APIs
export const taskApi = {
  getAll: () => api.get('/api/resource/Task?fields=name,subject,status,project'),
  getById: (id: string) => api.get(`/api/resource/Task/${id}`),
  create: (data: any) => api.post('/api/resource/Task', data),
  update: (id: string, data: any) => api.put(`/api/resource/Task/${id}`, data),
  delete: (id: string) => api.delete(`/api/resource/Task/${id}`),
};

// Sprint APIs
export const sprintApi = {
  getAll: () => api.get('/api/resource/Sprint?fields=["name","description","status"]'),
  getById: (id: string) => api.get(`/api/resource/Sprint/${id}`),
  create: (data: any) => api.post('/api/resource/Sprint', data),
  update: (id: string, data: any) => api.put(`/api/resource/Sprint/${id}`, data),
  delete: (id: string) => api.delete(`/api/resource/Sprint/${id}`),
};

                                                                                                                          