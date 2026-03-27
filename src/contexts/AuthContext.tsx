"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  profile_image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: User, remember: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('jb_token');
    setUser(null);
  }, []);

  const verifyToken = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/auth_verify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('jb_token');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, [verifyToken]);

  const login = (token: string, userData: User, remember: boolean) => {
    localStorage.setItem('jb_token', token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
