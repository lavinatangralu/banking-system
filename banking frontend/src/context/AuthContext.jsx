import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('banking_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user session on app load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setAccount(res.data.user.account);
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  // Refresh Account Details (Balance & Account Number)
  const refreshAccount = async () => {
    try {
      const res = await api.get('/account/details');
      if (res.data.success) {
        setAccount(res.data.account);
      }
    } catch (error) {
      console.error('Failed to refresh account details:', error);
    }
  };

  // Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('banking_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setAccount(res.data.user.account);
      return res.data;
    }
  };

  // Register
  const register = async (fullName, email, password) => {
    const res = await api.post('/auth/register', { fullName, email, password });
    if (res.data.success) {
      localStorage.setItem('banking_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setAccount(res.data.user.account);
      return res.data;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('banking_token');
    setToken(null);
    setUser(null);
    setAccount(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        token,
        loading,
        login,
        register,
        logout,
        refreshAccount,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

