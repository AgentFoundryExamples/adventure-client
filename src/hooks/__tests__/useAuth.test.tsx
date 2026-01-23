import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from '../useAuth';
import { AuthProvider } from '@/context/AuthContext';
import type { ReactNode } from 'react';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  getFirebaseAuth: vi.fn(() => ({ name: 'mock-auth' })),
}));

describe('useAuth', () => {
  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });

  it('returns auth context when used inside AuthProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => {
      return <AuthProvider>{children}</AuthProvider>;
    };

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.user).toBeDefined();
    expect(result.current.uid).toBeDefined();
    expect(result.current.loading).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(typeof result.current.signInWithEmailPassword).toBe('function');
    expect(typeof result.current.signUpWithEmailPassword).toBe('function');
    expect(typeof result.current.signOutUser).toBe('function');
    expect(typeof result.current.getIdToken).toBe('function');
  });

  it('includes optional signInWithGoogle method', () => {
    const wrapper = ({ children }: { children: ReactNode }) => {
      return <AuthProvider>{children}</AuthProvider>;
    };

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.signInWithGoogle).toBeDefined();
    expect(typeof result.current.signInWithGoogle).toBe('function');
  });
});
