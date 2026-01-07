import apiClient from './apiClient';

// ==================== AUTHENTICATION ====================

export const authService = {
  // Admin login
  login: async (credentials) => {
    const response = await apiClient.post('/auth/admin/login', credentials);
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    return response.data;
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
  getStoredUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  }
};

// ==================== MOVIES ====================

export const movieService = {
  // Get all movies (with pagination and filters)
  getMovies: async (params = {}) => {
    const response = await apiClient.get('/admin/movies', { params });
    return response.data;
  },

  // Get single movie
  getMovie: async (id) => {
    const response = await apiClient.get(`/admin/movies/${id}`);
    return response.data;
  },

  // Upload movie with files
  uploadMovie: async (formData) => {
    const response = await apiClient.post('/admin/movies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update movie
  updateMovie: async (id, formData) => {
    const response = await apiClient.put(`/admin/movies/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete movie
  deleteMovie: async (id) => {
    const response = await apiClient.delete(`/admin/movies/${id}`);
    return response.data;
  },

  // Toggle movie status (active/inactive)
  toggleStatus: async (id) => {
    const response = await apiClient.patch(`/admin/movies/${id}/toggle-status`);
    return response.data;
  }
};

// ==================== DASHBOARD STATS ====================

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  }
};

// ==================== USERS ====================

export const userService = {
  // Get all users
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  }
};

// Export all services
export default {
  auth: authService,
  movies: movieService,
  dashboard: dashboardService,
  users: userService
};