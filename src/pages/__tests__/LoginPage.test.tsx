import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function TestApp() {
  return (
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: false,
      error: null,
      signInWithEmailPassword: vi.fn().mockResolvedValue(undefined),
      signUpWithEmailPassword: vi.fn().mockResolvedValue(undefined),
      signOutUser: vi.fn(),
      signInWithGoogle: vi.fn().mockResolvedValue(undefined),
      getIdToken: vi.fn(),
    });
  });

  it('renders sign-in form by default', () => {
    render(<TestApp />);
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('toggles between sign-in and sign-up modes', () => {
    render(<TestApp />);
    
    // Click the Sign Up toggle button (in the auth-mode-toggle div)
    const toggleButtons = screen.getAllByRole('button', { name: /sign up/i });
    const signUpToggle = toggleButtons.find(btn => btn.parentElement?.className === 'auth-mode-toggle');
    fireEvent.click(signUpToggle!);
    
    // Should see Sign Up heading now
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('validates empty email field', async () => {
    render(<TestApp />);
    
    // Get submit button that is type="submit"
    const submitButtons = screen.getAllByRole('button', { name: 'Sign In' });
    const submitButton = submitButtons.find(btn => (btn as HTMLButtonElement).type === 'submit');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
    });
  });

  it('validates empty password field', async () => {
    render(<TestApp />);
    
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Get submit button that is type="submit"
    const submitButtons = screen.getAllByRole('button', { name: 'Sign In' });
    const submitButton = submitButtons.find(btn => (btn as HTMLButtonElement).type === 'submit');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(screen.getByText('Password is required.')).toBeInTheDocument();
    });
  });

  it('validates weak password in sign-up mode', async () => {
    render(<TestApp />);
    
    // Click the Sign Up toggle button
    const toggleButtons = screen.getAllByRole('button', { name: /sign up/i });
    const signUpToggle = toggleButtons.find(btn => btn.parentElement?.className === 'auth-mode-toggle');
    fireEvent.click(signUpToggle!);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    
    // Get submit button that is type="submit"
    const submitButtons = screen.getAllByRole('button', { name: 'Sign Up' });
    const submitButton = submitButtons.find(btn => (btn as HTMLButtonElement).type === 'submit');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    });
  });

  it('calls signInWithEmailPassword on sign-in submit', async () => {
    const mockSignIn = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: false,
      error: null,
      signInWithEmailPassword: mockSignIn,
      signUpWithEmailPassword: vi.fn(),
      signOutUser: vi.fn(),
      signInWithGoogle: vi.fn(),
      getIdToken: vi.fn(),
    });

    render(<TestApp />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Get submit button that is type="submit"
    const submitButtons = screen.getAllByRole('button', { name: 'Sign In' });
    const submitButton = submitButtons.find(btn => (btn as HTMLButtonElement).type === 'submit');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  });

  it('calls signUpWithEmailPassword on sign-up submit', async () => {
    const mockSignUp = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: false,
      error: null,
      signInWithEmailPassword: vi.fn(),
      signUpWithEmailPassword: mockSignUp,
      signOutUser: vi.fn(),
      signInWithGoogle: vi.fn(),
      getIdToken: vi.fn(),
    });

    render(<TestApp />);
    
    // Click the Sign Up toggle button
    const toggleButtons = screen.getAllByRole('button', { name: /sign up/i });
    const signUpToggle = toggleButtons.find(btn => btn.parentElement?.className === 'auth-mode-toggle');
    fireEvent.click(signUpToggle!);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Get submit button from the form
    const submitButtons = screen.getAllByRole('button', { name: 'Sign Up' });
    const submitButton = submitButtons.find(btn => (btn as HTMLButtonElement).type === 'submit');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  });

  it('displays Firebase error messages', async () => {
    const mockSignIn = vi.fn().mockRejectedValue({ 
      code: 'auth/wrong-password',
      message: 'Wrong password'
    });
    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: false,
      error: null,
      signInWithEmailPassword: mockSignIn,
      signUpWithEmailPassword: vi.fn(),
      signOutUser: vi.fn(),
      signInWithGoogle: vi.fn(),
      getIdToken: vi.fn(),
    });

    render(<TestApp />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    
    // Get submit button that is type="submit"
    const submitButtons = screen.getAllByRole('button', { name: 'Sign In' });
    const submitButton = submitButtons.find(btn => (btn as HTMLButtonElement).type === 'submit');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(screen.getByText('Incorrect password.')).toBeInTheDocument();
    });
  });

  it('calls signInWithGoogle when Google button is clicked', async () => {
    const mockGoogleSignIn = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: false,
      error: null,
      signInWithEmailPassword: vi.fn(),
      signUpWithEmailPassword: vi.fn(),
      signOutUser: vi.fn(),
      signInWithGoogle: mockGoogleSignIn,
      getIdToken: vi.fn(),
    });

    render(<TestApp />);
    
    const googleButton = screen.getByText(/continue with google/i);
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockGoogleSignIn).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  });

  it('handles Google sign-in popup blocked error', async () => {
    const mockGoogleSignIn = vi.fn().mockRejectedValue({
      code: 'auth/popup-blocked',
      message: 'Popup blocked'
    });
    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: false,
      error: null,
      signInWithEmailPassword: vi.fn(),
      signUpWithEmailPassword: vi.fn(),
      signOutUser: vi.fn(),
      signInWithGoogle: mockGoogleSignIn,
      getIdToken: vi.fn(),
    });

    render(<TestApp />);
    
    const googleButton = screen.getByText(/continue with google/i);
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('Sign-in popup was blocked by the browser.')).toBeInTheDocument();
    });
  });

  it('disables form inputs while loading', async () => {
    const mockSignIn = vi.fn(() => new Promise(() => {})); // Never resolves
    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: false,
      error: null,
      signInWithEmailPassword: mockSignIn,
      signUpWithEmailPassword: vi.fn(),
      signOutUser: vi.fn(),
      signInWithGoogle: vi.fn(),
      getIdToken: vi.fn(),
    });

    render(<TestApp />);
    
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Get submit button that is type="submit"
    const submitButtons = screen.getAllByRole('button', { name: 'Sign In' });
    const submitButton = submitButtons.find(btn => (btn as HTMLButtonElement).type === 'submit');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(emailInput.disabled).toBe(true);
      expect(passwordInput.disabled).toBe(true);
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });
  });

  it('redirects to /app if user is already authenticated', () => {
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
      signInWithGoogle: vi.fn(),
      getIdToken: vi.fn(),
    });

    render(<TestApp />);

    expect(mockNavigate).toHaveBeenCalledWith('/app');
  });

  it('does not show Google button when signInWithGoogle is not available', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: false,
      error: null,
      signInWithEmailPassword: vi.fn(),
      signUpWithEmailPassword: vi.fn(),
      signOutUser: vi.fn(),
      signInWithGoogle: undefined,
      getIdToken: vi.fn(),
    });

    render(<TestApp />);
    
    expect(screen.queryByText(/continue with google/i)).not.toBeInTheDocument();
  });
});
