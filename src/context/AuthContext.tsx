/**
 * Authentication Context Provider
 * Provides global auth state management with mock implementation
 * TODO: Replace mock implementation with real Firebase auth when ready
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextValue, User } from '@/types/auth';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Mock user data for development
const MOCK_USER: User = {
  id: 'mock-user-id-12345',
  email: 'adventurer@example.com',
  displayName: 'Mock Adventurer',
  avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=mock',
  createdAt: new Date('2024-01-01T00:00:00Z'),
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Mock: Start with authenticated state for development
  // TODO: Replace with real auth state from Firebase
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with real Firebase authentication
      // _password will be used when implementing real auth
      console.log('[Mock Auth] Login attempt:', { email });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock successful login
      setUser({
        ...MOCK_USER,
        email,
      });

      console.log('[Mock Auth] Login successful');
    } catch (error) {
      console.error('[Mock Auth] Login failed:', error);
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real Firebase logout
      console.log('[Mock Auth] Logout');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setUser(null);
      console.log('[Mock Auth] Logout successful');
    } catch (error) {
      console.error('[Mock Auth] Logout failed:', error);
      throw new Error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, _password: string, displayName: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with real Firebase registration
      // _password will be used when implementing real auth
      console.log('[Mock Auth] Register attempt:', { email, displayName });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock successful registration
      setUser({
        id: `mock-user-${Date.now()}`,
        email,
        displayName,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`,
        createdAt: new Date(),
      });

      console.log('[Mock Auth] Registration successful');
    } catch (error) {
      console.error('[Mock Auth] Registration failed:', error);
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
