import axios from 'axios';

// API Base URL - NO /api prefix for admin routes
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance WITHOUT /api prefix
const apiClient = axios.create({
  baseURL: API_BASE_URL, // This will be just http://localhost:5000
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug log to see what URL is being called
    console.log('🔵 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Debug log for successful responses
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Debug log for errors
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;