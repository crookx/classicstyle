
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  getIdTokenResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { addUserProfile } from '@/lib/firebase/firestoreService';

// Placeholder function to simulate initiating a welcome email process
// In a real app, this would likely call a backend API (e.g., a Firebase Cloud Function).
async function initiateWelcomeEmail(email: string, displayName?: string | null) {
  console.log('--- SIMULATING INITIATION OF WELCOME EMAIL ---');
  console.log('New User Details:', { email, displayName });
  console.log('Next Step: Call a backend API/Cloud Function to process and send the actual welcome email.');
  // Example:
  // try {
  //   const response = await fetch('/api/send-welcome-email', { // Your backend API endpoint
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email, displayName }),
  //   });
  //   if (!response.ok) {
  //     console.error('Failed to trigger welcome email:', await response.text());
  //   } else {
  //     console.log('Welcome email trigger successful.');
  //   }
  // } catch (error) {
  //   console.error('Error triggering welcome email:', error);
  // }
  console.log('--- END OF WELCOME EMAIL SIMULATION ---');
}


interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean | null; 
  loading: boolean;
  signup: (email: string, password: string) => Promise<User | null>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (user: User | null) => {
    if (user) {
      try {
        const idTokenResult = await user.getIdTokenResult(true); 
        setIsAdmin(idTokenResult.claims.admin === true);
      } catch (error) {
        console.error("Error fetching admin status:", error);
        setIsAdmin(false); 
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
      await checkAdminStatus(user); 
      setLoading(false);
    });
    return unsubscribe; 
  }, []);

  const signup = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        // Add user profile to Firestore
        await addUserProfile(userCredential.user.uid, userCredential.user.email || email, userCredential.user.displayName);
        
        // Simulate welcome email trigger
        await initiateWelcomeEmail(userCredential.user.email || email, userCredential.user.displayName);

        setCurrentUser(userCredential.user);
        await checkAdminStatus(userCredential.user); 
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
      await checkAdminStatus(userCredential.user); 
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
      setIsAdmin(null); 
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

    