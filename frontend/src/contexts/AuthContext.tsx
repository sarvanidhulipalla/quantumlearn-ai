import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('ql_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ql_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('ql_token');
      if (storedToken) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          localStorage.setItem('ql_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Session expired or invalid:', error);
          localStorage.removeItem('ql_token');
          localStorage.removeItem('ql_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('ql_token', response.access_token);
      localStorage.setItem('ql_user', JSON.stringify(response.user));
      setToken(response.access_token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      localStorage.setItem('ql_token', response.access_token);
      localStorage.setItem('ql_user', JSON.stringify(response.user));
      setToken(response.access_token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ql_token');
    localStorage.removeItem('ql_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const freshUser = await authService.getMe();
        setUser(freshUser);
        localStorage.setItem('ql_user', JSON.stringify(freshUser));
      } catch (e) {
        console.error('Failed to refresh user data:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
