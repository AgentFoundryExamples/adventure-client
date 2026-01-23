/**
 * Authentication Context Provider
 * Provides global auth state management using Firebase Authentication
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
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
    let isInitialLoad = true;
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        if (isInitialLoad) {
          setLoading(false);
          isInitialLoad = false;
        }
        setError(null);
      },
      (err) => {
        console.error('Auth state change error:', err);
        setError(err as Error);
        if (isInitialLoad) {
          setLoading(false);
          isInitialLoad = false;
        }
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithEmailPassword = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (err) {
      const authError = err as Error;
      setError(authError);
      throw authError;
    }
  }, []);

  const signUpWithEmailPassword = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (err) {
      const authError = err as Error;
      setError(authError);
      throw authError;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (err) {
      const authError = err as Error;
      setError(authError);
      throw authError;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (err) {
      const authError = err as Error;
      setError(authError);
      throw authError;
    }
  }, []);

  const getIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    if (!user) {
      return null;
    }
    try {
      return await user.getIdToken(forceRefresh);
    } catch (err) {
      const tokenError = err as Error;
      setError(tokenError);
      throw tokenError;
    }
  }, [user]);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      uid: user?.uid ?? null,
      loading,
      error,
      signInWithEmailPassword,
      signUpWithEmailPassword,
      signOutUser,
      signInWithGoogle,
      getIdToken,
    }),
    [user, loading, error, signInWithEmailPassword, signUpWithEmailPassword, signOutUser, signInWithGoogle, getIdToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
