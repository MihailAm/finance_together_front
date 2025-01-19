import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser } from '../services/AuthService';
import { saveTokens, removeTokens, getAccessToken } from '../services/TokenService';
import { Linking } from 'react-native';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, surname: string, email: string, password: string) => Promise<void>;
  loginWithYandex: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      if (token) {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token, refresh_token } = await loginUser(email, password);
    await saveTokens(access_token, refresh_token);
    setIsAuthenticated(true);
  };

  const register = async (name: string, surname: string, email: string, password: string) => {
    const { access_token, refresh_token } = await registerUser(name, surname, email, password);
    await saveTokens(access_token, refresh_token);
    setIsAuthenticated(true);
  };

  const loginWithYandex = async (accessToken: string, refreshToken: string) => {
    await saveTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await removeTokens();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, loginWithYandex, logout }}>
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


