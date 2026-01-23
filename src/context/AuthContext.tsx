/**
 * Authentication Context Provider
 * Provides global auth state management using Firebase Authentication
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { getFirebaseAuth } from '@/lib/firebase';
import type { AuthContextValue, AuthError } from '@/types/auth';

// Safe navigation hook that doesn't throw if not in router context
function useSafeNavigate() {
  try {
    return useNavigate();
  } catch {
    // If not in a router context (e.g., in tests), return a no-op function
    return () => {};
  }
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const navigate = useSafeNavigate();
  
  // Track ongoing token refresh to prevent multiple overlapping attempts
  const tokenRefreshPromiseRef = useRef<Promise<string | null> | null>(null);
  const hasAttemptedRefreshRef = useRef<Map<string, boolean>>(new Map());

  // Helper to create structured auth errors
  const createAuthError = useCallback((message: string, reason: AuthError['reason'], code?: string): AuthError => {
    console.error(`[AuthContext] ${message}`, { reason, code });
    return { message, code, reason };
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const auth = getFirebaseAuth();
    let isInitialLoad = true;
    let previousUser: FirebaseUser | null = null;
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // If user becomes null mid-session (not initial load), cleanup and redirect
        if (!firebaseUser && previousUser !== null && !isInitialLoad) {
          console.warn('[AuthContext] User became null mid-session, redirecting to login');
          setUser(null);
          setError(createAuthError(
            'Session expired or user logged out',
            'no-user'
          ));
          // Clear any pending token refresh promises
          tokenRefreshPromiseRef.current = null;
          hasAttemptedRefreshRef.current.clear();
          navigate('/login', { 
            replace: true,
            state: { message: 'Your session has expired. Please log in again.' }
          });
        } else {
          setUser(firebaseUser);
          if (isInitialLoad) {
            setLoading(false);
            isInitialLoad = false;
          }
          setError(null);
        }
        previousUser = firebaseUser;
      },
      (err) => {
        console.error('[AuthContext] Auth state change error:', err);
        const authError = createAuthError(
          err instanceof Error ? err.message : 'Authentication state error',
          'firebase-error',
          err instanceof Error && 'code' in err ? (err as { code: string }).code : undefined
        );
        setError(authError);
        if (isInitialLoad) {
          setLoading(false);
          isInitialLoad = false;
        }
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [createAuthError, navigate]);

  const signInWithEmailPassword = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (err) {
      const authError = createAuthError(
        err instanceof Error ? err.message : 'Failed to sign in',
        'firebase-error',
        err instanceof Error && 'code' in err ? (err as { code: string }).code : undefined
      );
      setError(authError);
      throw authError;
    }
  }, [createAuthError]);

  const signUpWithEmailPassword = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (err) {
      const authError = createAuthError(
        err instanceof Error ? err.message : 'Failed to sign up',
        'firebase-error',
        err instanceof Error && 'code' in err ? (err as { code: string }).code : undefined
      );
      setError(authError);
      throw authError;
    }
  }, [createAuthError]);

  const signOutUser = useCallback(async () => {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      // Clear refresh tracking on logout
      tokenRefreshPromiseRef.current = null;
      hasAttemptedRefreshRef.current.clear();
      await signOut(auth);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (err) {
      const authError = createAuthError(
        err instanceof Error ? err.message : 'Failed to sign out',
        'firebase-error',
        err instanceof Error && 'code' in err ? (err as { code: string }).code : undefined
      );
      setError(authError);
      throw authError;
    }
  }, [createAuthError]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (err) {
      const authError = createAuthError(
        err instanceof Error ? err.message : 'Failed to sign in with Google',
        'firebase-error',
        err instanceof Error && 'code' in err ? (err as { code: string }).code : undefined
      );
      setError(authError);
      throw authError;
    }
  }, [createAuthError]);

  const getIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    if (!user) {
      return null;
    }

    // If there's already an ongoing token refresh, return that promise
    // This prevents multiple overlapping refresh attempts
    if (tokenRefreshPromiseRef.current && !forceRefresh) {
      console.log('[AuthContext] Token refresh already in progress, reusing promise');
      return tokenRefreshPromiseRef.current;
    }

    const refreshKey = `${user.uid}-${Date.now()}`;
    
    const refreshPromise = (async () => {
      try {
        console.log(`[AuthContext] Getting ID token (forceRefresh: ${forceRefresh})`);
        const token = await user.getIdToken(forceRefresh);
        
        // Clear the pending promise on success
        tokenRefreshPromiseRef.current = null;
        hasAttemptedRefreshRef.current.delete(refreshKey);
        
        return token;
      } catch (err) {
        console.error('[AuthContext] Failed to get ID token:', err);
        
        // If this is the first failure and we haven't forced a refresh yet, try once more
        if (!forceRefresh && !hasAttemptedRefreshRef.current.has(refreshKey)) {
          hasAttemptedRefreshRef.current.set(refreshKey, true);
          console.log('[AuthContext] Attempting token refresh after initial failure');
          
          try {
            const token = await user.getIdToken(true);
            tokenRefreshPromiseRef.current = null;
            hasAttemptedRefreshRef.current.delete(refreshKey);
            return token;
          } catch (retryErr) {
            console.error('[AuthContext] Token refresh attempt failed:', retryErr);
            
            // Both attempts failed, logout and redirect
            const authError = createAuthError(
              'Failed to refresh authentication token',
              'token-refresh-failed',
              retryErr instanceof Error && 'code' in retryErr ? (retryErr as { code: string }).code : undefined
            );
            setError(authError);
            
            // Clear state and redirect to login
            tokenRefreshPromiseRef.current = null;
            hasAttemptedRefreshRef.current.clear();
            
            console.warn('[AuthContext] Token refresh failed after retry, logging out');
            const auth = getFirebaseAuth();
            await signOut(auth).catch(signOutErr => {
              console.error('[AuthContext] Failed to sign out after token refresh failure:', signOutErr);
            });
            
            navigate('/login', {
              replace: true,
              state: { 
                message: 'Your session has expired. Please log in again.',
                reason: 'token-refresh-failed'
              }
            });
            
            throw authError;
          }
        }
        
        // If we already tried refresh or it was explicitly requested to force refresh
        const authError = createAuthError(
          err instanceof Error ? err.message : 'Failed to get authentication token',
          'token-expired',
          err instanceof Error && 'code' in err ? (err as { code: string }).code : undefined
        );
        setError(authError);
        tokenRefreshPromiseRef.current = null;
        hasAttemptedRefreshRef.current.delete(refreshKey);
        throw authError;
      }
    })();

    // Store the promise to prevent concurrent refresh attempts
    if (forceRefresh || !tokenRefreshPromiseRef.current) {
      tokenRefreshPromiseRef.current = refreshPromise;
    }

    return refreshPromise;
  }, [user, createAuthError, navigate]);

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
