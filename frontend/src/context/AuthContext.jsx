import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    await api.post('/auth/login', credentials);
    // After successful login, server sets httpOnly cookie. Fetch profile.
    await fetchMe();
    return user;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    setUser(null);
  };

  const register = async (userInfo) => {
    await api.post('/auth/register', userInfo);
    await fetchMe();
    return user;
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUser = (next) => {
    setUser(next);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
