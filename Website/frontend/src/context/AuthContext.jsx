import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../utils/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoggedIn = () => {
      const userInfoString = localStorage.getItem('userInfo');
      if (userInfoString) {
        try {
          const parsedUser = JSON.parse(userInfoString);
          setUser(parsedUser);
        } catch (err) {
          console.error('Failed to parse cached user info', err);
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateProfile = async (updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.put('/auth/profile', updatedData);
      
      const updatedUser = {
        ...data,
        token: data.token || user?.token || '',
      };
      
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setLoading(false);
      return updatedUser;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Profile update failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

