import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminUser');
    
    if (token && storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        // Verify admin role
        if (adminData.role === 'admin') {
          setAdmin(adminData);
          setIsAuthenticated(true);
        } else {
          // Not an admin, clear storage
          authService.logout();
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        // Clear invalid data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      console.log('Login response:', response); // Debug log
      
      // Handle different response structures
      const userData = response.user || response.data?.user || response;
      const token = response.token || response.data?.token;
      
      if (!userData) {
        throw new Error('Invalid response from server');
      }
      
      // Verify admin role
      if (userData.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // Store in localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      
      setAdmin(userData);
      setIsAuthenticated(true);
      return { success: true, data: response };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const value = {
    admin,
    loading,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;