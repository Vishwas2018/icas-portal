import React, { createContext, useContext, useEffect, useState } from 'react';

import { authenticateUser } from '../utils/mockDataService';

// Create the authentication context
const AuthContext = createContext();

/**
 * AuthProvider component for managing authentication state
 * @param {Object} props - Component props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('icasUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('icasUser');
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);
  
  /**
   * Login function
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const userData = await authenticateUser(email, password);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('icasUser', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Demo login function for easy access
   */
  const demoLogin = async () => {
    try {
      setIsLoading(true);
      const userData = {
        id: '12345',
        firstName: 'Alex',
        lastName: 'Student',
        email: 'student@example.com',
        role: 'student',
        trialDaysLeft: 5
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('icasUser', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Logout function
   */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('icasUser');
  };
  
  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    demoLogin,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook for accessing the auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};