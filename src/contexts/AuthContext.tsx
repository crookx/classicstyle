
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  getIdTokenResult, // Import this
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { addUserProfile } from '@/lib/firebase/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean | null; // Added for admin role
  loading: boolean;
  signup: (email: string, password: string) => Promise<User | null>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<void>; // Added to manually refresh token
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (user: User | null) => {
    if (user) {
      try {
        const idTokenResult = await user.getIdTokenResult(true); // Force refresh token
        setIsAdmin(idTokenResult.claims.admin === true);
      } catch (error) {
        console.error("Error fetching admin status:", error);
        setIsAdmin(false); // Default to not admin on error
      }
    } else {
      setIsAdmin(null);
    }
  };
  
  const refreshAuthToken = async () => {
    if (currentUser) {
      await checkAdminStatus(currentUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await checkAdminStatus(user); // Check admin status when auth state changes
      setLoading(false);
    });
    return unsubscribe; 
  }, []);

  const signup = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await addUserProfile(userCredential.user.uid, userCredential.user.email || email, userCredential.user.displayName);
        setCurrentUser(userCredential.user);
        await checkAdminStatus(userCredential.user); // Check admin status after signup
        return userCredential.user;
      }
      return null;
    } catch (error) {
      console.error("Error signing up:", error);
      setIsAdmin(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      await checkAdminStatus(userCredential.user); // Check admin status after login
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in:", error);
      setIsAdmin(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setIsAdmin(null); // Reset admin status on logout
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    signup,
    login,
    logout,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
