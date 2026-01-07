import api from './api';

const authService = {
  // Admin login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },

  // Check if admin is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },

  // Get stored admin user
  getCurrentAdmin: () => {
    const admin = localStorage.getItem('adminUser');
    return admin ? JSON.parse(admin) : null;
  },

  // Upload movie
  uploadMovie: async (formData) => {
    try {
      const response = await api.post('/admin/movies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Upload failed' };
    }
  },

  // Get all movies
  getAllMovies: async (params = {}) => {
    try {
      const response = await api.get('/admin/movies', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch movies' };
    }
  },

  // Get single movie
  getMovie: async (id) => {
    try {
      const response = await api.get(`/admin/movies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch movie' };
    }
  },

  // Update movie
  updateMovie: async (id, formData) => {
    try {
      const response = await api.put(`/admin/movies/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Update failed' };
    }
  },

  // Delete movie
  deleteMovie: async (id) => {
    try {
      const response = await api.delete(`/admin/movies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Delete failed' };
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch stats' };
    }
  }
};

export default authService;