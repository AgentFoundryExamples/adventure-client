import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';

// Mock config
vi.mock('@/config/env', () => ({
  config: {
    isDevelopment: false,
    dungeonMasterApiBaseUrl: 'http://localhost:8000',
    journeyLogApiBaseUrl: 'http://localhost:8001',
  },
}));

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock AccountMenu component
vi.mock('@/components/AccountMenu', () => ({
  default: () => <div data-testid="account-menu">AccountMenu</div>,
}));

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation links', () => {
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

    render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('App')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders the main outlet container', () => {
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

    const { container } = render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );

    const mainElement = container.querySelector('.app-main');
    expect(mainElement).toBeInTheDocument();
  });

  it('renders "New Character" button when user is authenticated', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
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

    render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );

    const newCharButton = screen.getByText('+ New Character');
    expect(newCharButton).toBeInTheDocument();
    expect(newCharButton).toHaveAttribute('href', '/characters/new');
  });

  it('does not render "New Character" button when user is not authenticated', () => {
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

    render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );

    expect(screen.queryByText('+ New Character')).not.toBeInTheDocument();
  });
});
