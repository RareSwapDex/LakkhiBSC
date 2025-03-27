import React, { createContext, useContext, useState } from 'react';

// Create the auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and provides auth context
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Admin is always true in this simplified version
  const isAdmin = true;
  const isAuthenticated = true;
  
  // Mock user data
  const currentUser = {
    id: 1,
    username: 'admin',
    email: 'admin@lakkhi.com',
    isAdmin: true
  };

  // Store token in localStorage and state
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  // Clear token from localStorage and state
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Value to be provided to consuming components
  const value = {
    token,
    currentUser,
    isAuthenticated,
    isAdmin,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 