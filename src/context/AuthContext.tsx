/**
 * Authentication Context Provider
 * Provides global auth state management using Firebase Authentication
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import type { AuthContextValue } from '@/types/auth';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const auth = getFirebaseAuth();
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Auth state change error:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithEmailPassword = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const authError = err as Error;
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithEmailPassword = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const authError = err as Error;
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch (err) {
      const authError = err as Error;
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      const authError = err as Error;
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  const getIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    try {
      if (!user) {
        return null;
      }
      return await user.getIdToken(forceRefresh);
    } catch (err) {
      console.error('Failed to get ID token:', err);
      return null;
    }
  }, [user]);

  const value: AuthContextValue = {
    user,
    uid: user?.uid ?? null,
    loading,
    error,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOutUser,
    signInWithGoogle,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
