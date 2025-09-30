import React, { createContext, useContext } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { openSignIn, openSignUp, signOut } = useClerk();

  const login = async () => {
    try {
      await openSignIn();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const register = async () => {
    try {
      await openSignUp();
    } catch (error: any) {
      console.error('Registration error:', error);
    }
  };

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading: !isLoaded, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 