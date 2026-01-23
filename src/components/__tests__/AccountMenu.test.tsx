import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccountMenu from '../AccountMenu';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AccountMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while auth is resolving', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: true,
      error: null,
      signInWithEmailPassword: vi.fn(),
      signUpWithEmailPassword: vi.fn(),
      signOutUser: vi.fn(),
      getIdToken: vi.fn(),
    });

    render(<AccountMenu />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('returns null when no user is authenticated and not loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: false,
      error: null,
      signInWithEmailPassword: vi.fn(),
      signUpWithEmailPassword: vi.fn(),
      signOutUser: vi.fn(),
      getIdToken: vi.fn(),
    });

    const { container } = render(<AccountMenu />);
    expect(container.firstChild).toBeNull();
  });

  it('displays user email when authenticated', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: null,
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

    mockUseAuth.mockReturnValue({
      user: mockUser,
      uid: 'test-uid',
      loading: false,
      error: null,
      signInWithEmailPassword: vi.fn(),
      signUpWithEmailPassword: vi.fn(),
      signOutUser: vi.fn(),
      getIdToken: vi.fn(),
    });

    render(<AccountMenu />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('prefers displayName over email when available', () => {
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

    mockUseAuth.mockReturnValue({
      user: mockUser,
      uid: 'test-uid',
      loading: false,
      error: null,
      signInWithEmailPassword: vi.fn(),
      signUpWithEmailPassword: vi.fn(),
      signOutUser: vi.fn(),
      getIdToken: vi.fn(),
    });

    render(<AccountMenu />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
  });

  it('shows fallback when user has no email or displayName', () => {
    const mockUser = {
      uid: 'test-uid',
      email: null,
      displayName: null,
      emailVerified: false,
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

    mockUseAuth.mockReturnValue({
      user: mockUser,
      uid: 'test-uid',
      loading: false,
      error: null,
      signInWithEmailPassword: vi.fn(),
      signUpWithEmailPassword: vi.fn(),
      signOutUser: vi.fn(),
      getIdToken: vi.fn(),
    });

    render(<AccountMenu />);
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('calls signOutUser when sign out button is clicked', async () => {
    const mockSignOut = vi.fn().mockResolvedValue(undefined);
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

    mockUseAuth.mockReturnValue({
      user: mockUser,
      uid: 'test-uid',
      loading: false,
      error: null,
      signInWithEmailPassword: vi.fn(),
      signUpWithEmailPassword: vi.fn(),
      signOutUser: mockSignOut,
      getIdToken: vi.fn(),
    });

    render(<AccountMenu />);
    
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  it('handles sign out errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockSignOut = vi.fn().mockRejectedValue(new Error('Sign out failed'));
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

    mockUseAuth.mockReturnValue({
      user: mockUser,
      uid: 'test-uid',
      loading: false,
      error: null,
      signInWithEmailPassword: vi.fn(),
      signUpWithEmailPassword: vi.fn(),
      signOutUser: mockSignOut,
      getIdToken: vi.fn(),
    });

    render(<AccountMenu />);
    
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Sign out error:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});
