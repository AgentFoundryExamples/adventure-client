import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AppLayout', () => {
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
});
