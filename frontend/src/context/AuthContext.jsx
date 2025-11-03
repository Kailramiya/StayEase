import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = getCookie('user');
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  });

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data);
    setCookie('user', JSON.stringify(data), 7);
    return data;
  };

  const logout = () => {
    setUser(null);
    deleteCookie('user');
  };

  const register = async (userInfo) => {
    const { data } = await api.post('/auth/register', userInfo);
    setUser(data);
    setCookie('user', JSON.stringify(data), 7);
    return data;
  };

  useEffect(() => {
    // Optionally validate token or refresh user info on mount
  }, []);

  const updateUser = (next) => {
    // Update React state and persist to localStorage
    setUser(next);
    try {
      if (next) setCookie('user', JSON.stringify(next), 7);
      else deleteCookie('user');
    } catch (err) {
      console.warn('Failed to persist user to localStorage', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        // keep the public name `setUser` for compatibility with existing consumers
        setUser: updateUser,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
