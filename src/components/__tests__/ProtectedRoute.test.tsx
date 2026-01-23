import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import type { AuthContextValue } from '@/types/auth';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

function TestApp({ authState }: { authState: Partial<AuthContextValue> }) {
  mockUseAuth.mockReturnValue(authState);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set initial location to /protected
    window.history.pushState({}, '', '/protected');
  });

  it('shows loading indicator while auth state is loading', () => {
    render(
      <TestApp
        authState={{
          user: null,
          uid: null,
          loading: true,
          error: null,
          signInWithEmailPassword: vi.fn(),
          signUpWithEmailPassword: vi.fn(),
          signOutUser: vi.fn(),
          getIdToken: vi.fn(),
        }}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', async () => {
    render(
      <TestApp
        authState={{
          user: null,
          uid: null,
          loading: false,
          error: null,
          signInWithEmailPassword: vi.fn(),
          signUpWithEmailPassword: vi.fn(),
          signOutUser: vi.fn(),
          getIdToken: vi.fn(),
        }}
      />
    );

    // Should redirect to login page
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: vi.fn(),
      getIdToken: vi.fn(),
      getIdTokenResult: vi.fn(),
      reload: vi.fn(),
      toJSON: vi.fn(),
      phoneNumber: null,
      photoURL: null,
      providerId: 'firebase',
    };

    render(
      <TestApp
        authState={{
          user: mockUser,
          uid: 'test-uid',
          loading: false,
          error: null,
          signInWithEmailPassword: vi.fn(),
          signUpWithEmailPassword: vi.fn(),
          signOutUser: vi.fn(),
          getIdToken: vi.fn(),
        }}
      />
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('handles rapid auth state changes without flicker', () => {
    const { rerender } = render(
      <TestApp
        authState={{
          user: null,
          uid: null,
          loading: true,
          error: null,
          signInWithEmailPassword: vi.fn(),
          signUpWithEmailPassword: vi.fn(),
          signOutUser: vi.fn(),
          getIdToken: vi.fn(),
        }}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Simulate auth state resolving to authenticated user
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: vi.fn(),
      getIdToken: vi.fn(),
      getIdTokenResult: vi.fn(),
      reload: vi.fn(),
      toJSON: vi.fn(),
      phoneNumber: null,
      photoURL: null,
      providerId: 'firebase',
    };

    rerender(
      <TestApp
        authState={{
          user: mockUser,
          uid: 'test-uid',
          loading: false,
          error: null,
          signInWithEmailPassword: vi.fn(),
          signUpWithEmailPassword: vi.fn(),
          signOutUser: vi.fn(),
          getIdToken: vi.fn(),
        }}
      />
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
