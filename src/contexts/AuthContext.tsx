import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('customerToken');
    const savedUser = localStorage.getItem('user');
    
    if (storedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('customerToken');
        setIsAuthenticated(false);
      }
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('user');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
    const storedToken = localStorage.getItem('customerToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerId');
    localStorage.removeItem('user');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('customerPhone');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        setUser,
        setIsAuthenticated
      }}
    >
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