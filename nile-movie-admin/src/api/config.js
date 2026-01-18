// API Configuration for ADMIN PANEL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Full API URL with /api prefix
export const API_URL = `${API_BASE_URL}/api`;

export const API_ENDPOINTS = {
  // Authentication
  ADMIN_LOGIN: `${API_URL}/auth/admin/login`,
  
  // Admin Movies
  ADMIN_MOVIES: `${API_URL}/admin/movies`,
  ADMIN_MOVIE_DETAIL: (id) => `${API_URL}/admin/movies/${id}`,
  ADMIN_TOGGLE_STATUS: (id) => `${API_URL}/admin/movies/${id}/toggle-status`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_URL}/admin/dashboard/stats`,
  
  // Users
  ADMIN_USERS: `${API_URL}/admin/users`,
  ADMIN_USER_DETAIL: (id) => `${API_URL}/admin/users/${id}`,
};

// Helper function to get full upload URL
export const getUploadUrl = (relativePath) => {
  if (!relativePath) return null;
  // If it's already a full URL, return it
  if (relativePath.startsWith('http')) return relativePath;
  // Remove leading slash if present
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  // Return full URL
  return `${API_BASE_URL}/${cleanPath}`;
};

export default {
  API_BASE_URL,
  API_URL,
  API_ENDPOINTS,
  getUploadUrl
};