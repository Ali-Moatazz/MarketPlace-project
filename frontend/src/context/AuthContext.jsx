import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMyProfile } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getMyProfile();
          if (res.success) {
            setUser(res.data);
          }
        } catch (err) {
          console.error("Session expired");
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // --- UPDATED LOGIN FUNCTION ---
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await loginUser({ email, password });
      
      // Based on your userController.js, the structure is res.data.user and res.data.token
      if (res.success) {
        const userData = res.data.user; 
        const token = res.data.token;

        localStorage.setItem('token', token);
        setUser(userData); 
        
        return userData; // <--- RETURN THE USER OBJECT, NOT JUST "TRUE"
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return null;
    }
  };

  // --- UPDATED REGISTER FUNCTION ---
  const register = async (userDataPayload) => {
    setError(null);
    try {
      const res = await registerUser(userDataPayload);
      if (res.success) {
        const userData = res.data.user;
        const token = res.data.token;

        localStorage.setItem('token', token);
        setUser(userData);
        
        return userData; // <--- RETURN USER DATA HERE TOO
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;