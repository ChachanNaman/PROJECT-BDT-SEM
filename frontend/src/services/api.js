import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const ML_API_URL = process.env.REACT_APP_ML_API_URL || 'http://localhost:8000';

// Create axios instances
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const mlApi = axios.create({
  baseURL: ML_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

mlApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data)
};

// Content API
export const contentAPI = {
  getAll: (params) => api.get('/content', { params }),
  getById: (id) => api.get(`/content/${id}`),
  getByType: (type, params) => api.get(`/content/type/${type}`, { params })
};

// Ratings API
export const ratingsAPI = {
  addRating: (data) => api.post('/ratings', data),
  getUserRatings: () => api.get('/ratings/user'),
  getContentRating: (contentId) => api.get(`/ratings/content/${contentId}`)
};

// Search API
export const searchAPI = {
  search: (params) => api.get('/search', { params })
};

// Upload API
export const uploadAPI = {
  uploadCSV: (file, contentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contentType', contentType);
    
    const token = localStorage.getItem('token');
    return axios.post(`${API_BASE_URL}/upload/csv`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// ML API
export const mlAPI = {
  getRecommendations: (contentType, userId, limit = 10) => 
    mlApi.post(`/recommendations/${contentType}`, { userId, limit }),
  getTrending: (contentType, limit = 10) => 
    mlApi.get(`/trending/${contentType}`, { params: { limit } }),
  getSimilar: (contentId, limit = 10) => 
    mlApi.get(`/similar/${contentId}`, { params: { limit } })
};

// Analytics API
export const analyticsAPI = {
  getContentAgg: () => api.get('/analytics/content-agg'),
  getTrends: () => api.get('/analytics/trends'),
  getKpis: () => api.get('/analytics/kpis')
};

export default api;



