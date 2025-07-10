import React, { createContext, useContext } from 'react';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { toast } from 'react-toastify';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const db = getFirestore();

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!', { position: 'top-center' });
    } catch (error: any) {
      toast.error('Login failed: ' + error.message, { position: 'top-center' });
      console.error('Login error:', error);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
        // Save displayName to Firestore
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName,
          email: auth.currentUser.email,
          createdAt: new Date().toISOString(),
        });
      }
      toast.success('Registered successfully!', { position: 'top-center' });
    } catch (error: any) {
      toast.error('Registration failed: ' + error.message, { position: 'top-center' });
      console.error('Registration error:', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 