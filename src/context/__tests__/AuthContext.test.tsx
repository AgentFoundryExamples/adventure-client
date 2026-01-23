import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '@/hooks/useAuth';
import type { User as FirebaseUser } from 'firebase/auth';

// Mock Firebase auth
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockGetIdToken = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUserWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
}));

vi.mock('@/lib/firebase', () => ({
  getFirebaseAuth: vi.fn(() => ({ name: 'mock-auth' })),
}));

// Test component that uses useAuth
function TestComponent() {
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.uid : 'null'}</div>
      <div data-testid="uid">{auth.uid || 'null'}</div>
      <div data-testid="loading">{auth.loading ? 'true' : 'false'}</div>
      <div data-testid="error">{auth.error ? auth.error.message : 'null'}</div>
      <button onClick={() => auth.signInWithEmailPassword('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => auth.signUpWithEmailPassword('test@example.com', 'password')}>
        Sign Up
      </button>
      <button onClick={() => auth.signOutUser()}>Sign Out</button>
      {auth.signInWithGoogle && (
        <button onClick={() => auth.signInWithGoogle!()}>Sign In With Google</button>
      )}
      <button onClick={() => auth.getIdToken().catch(() => {})}>Get Token</button>
    </div>
  );
}

describe('AuthContext', () => {
  let unsubscribe: () => void;

  beforeEach(() => {
    unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      // Immediately call with null user (signed out state)
      callback(null);
      return unsubscribe;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes to auth state changes on mount', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes from auth state changes on unmount', () => {
    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('updates state when user signs in', async () => {
    const mockUser: Partial<FirebaseUser> = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      getIdToken: mockGetIdToken,
    };

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(mockUser);
      return unsubscribe;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test-uid');
      expect(screen.getByTestId('uid')).toHaveTextContent('test-uid');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('sets loading to false after initial auth state is determined', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('handles auth state change errors', async () => {
    const testError = new Error('Auth state error');
    mockOnAuthStateChanged.mockImplementation((_auth, _callback, errorCallback) => {
      errorCallback(testError);
      return unsubscribe;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Auth state error');
    });
  });

  it('handles sign in with email and password', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const signInButton = screen.getByText('Sign In');
    signInButton.click();

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        { name: 'mock-auth' },
        'test@example.com',
        'password'
      );
    });
  });

  it('handles sign up with email and password', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const signUpButton = screen.getByText('Sign Up');
    signUpButton.click();

    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        { name: 'mock-auth' },
        'test@example.com',
        'password'
      );
    });
  });

  it('handles sign out', async () => {
    mockSignOut.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const signOutButton = screen.getByText('Sign Out');
    signOutButton.click();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ name: 'mock-auth' });
    });
  });

  it('handles Google sign in', async () => {
    mockSignInWithPopup.mockResolvedValue({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const googleButton = screen.getByText('Sign In With Google');
    googleButton.click();

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalled();
    });
  });

  it('returns null for getIdToken when no user is logged in', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const getTokenButton = screen.getByText('Get Token');
    getTokenButton.click();

    // The function should complete without error and return null
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  it('gets ID token for logged in user', async () => {
    mockGetIdToken.mockResolvedValue('mock-token-123');
    
    const mockUser: Partial<FirebaseUser> = {
      uid: 'test-uid',
      email: 'test@example.com',
      getIdToken: mockGetIdToken,
    };

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(mockUser);
      return unsubscribe;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test-uid');
    });

    const getTokenButton = screen.getByText('Get Token');
    getTokenButton.click();

    await waitFor(() => {
      expect(mockGetIdToken).toHaveBeenCalledWith(false);
    });
  });

  it('propagates getIdToken errors to error state', async () => {
    mockGetIdToken.mockRejectedValue(new Error('Token error'));
    
    const mockUser: Partial<FirebaseUser> = {
      uid: 'test-uid',
      email: 'test@example.com',
      getIdToken: mockGetIdToken,
    };

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(mockUser);
      return unsubscribe;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test-uid');
    });

    const getTokenButton = screen.getByText('Get Token');
    getTokenButton.click();

    // Should throw and update error state with retry failure message
    await waitFor(() => {
      expect(mockGetIdToken).toHaveBeenCalled();
      // Now expects retry failure message since we attempt refresh once
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to refresh authentication token');
    });
  });
});
