import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import DebugPage from '../DebugPage';

// Mock API services
const mockHealthCheckHealthGet = vi.fn();
const mockHealthHealthGet = vi.fn();
const mockInfoInfoGet = vi.fn();
const mockTestFirestorePost = vi.fn();

vi.mock('@/api', () => ({
  GameService: {
    healthCheckHealthGet: () => mockHealthCheckHealthGet(),
  },
  DefaultService: {
    healthHealthGet: () => mockHealthHealthGet(),
    infoInfoGet: () => mockInfoInfoGet(),
  },
  OperationsService: {
    testFirestorePostFirestoreTestPost: () => mockTestFirestorePost(),
  },
}));

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

function TestApp() {
  return (
    <BrowserRouter>
      <DebugPage />
    </BrowserRouter>
  );
}

describe('DebugPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: false,
      error: null,
      getIdToken: vi.fn().mockResolvedValue(null),
    });
  });

  it('renders page title and subtitle', () => {
    render(<TestApp />);
    expect(screen.getByRole('heading', { name: 'API Diagnostics' })).toBeInTheDocument();
    expect(screen.getByText(/Development-only diagnostic tool/i)).toBeInTheDocument();
  });

  it('shows authentication warning when user is not signed in', () => {
    render(<TestApp />);
    expect(screen.getByText('⚠️ Authentication Required')).toBeInTheDocument();
    expect(screen.getByText(/Please sign in to test authenticated API endpoints/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Login page/i })).toHaveAttribute('href', '/login');
  });

  it('shows authentication status when user is signed in', () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      },
      uid: 'test-uid',
      loading: false,
      error: null,
      getIdToken: vi.fn().mockResolvedValue('test-token'),
    });

    render(<TestApp />);
    expect(screen.getByText('Authentication Status')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('test-uid')).toBeInTheDocument();
    expect(screen.getByText('✓ Authenticated')).toBeInTheDocument();
  });

  it('renders all API test buttons', () => {
    render(<TestApp />);
    expect(screen.getByRole('button', { name: /Test Dungeon Master \/health/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Test Journey Log \/health/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Test Journey Log \/info/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Test Firestore Connectivity/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear Results/i })).toBeInTheDocument();
  });

  it('disables Firestore test button when user is not signed in', () => {
    render(<TestApp />);
    const firestoreButton = screen.getByRole('button', { name: /Test Firestore Connectivity/i });
    expect(firestoreButton).toBeDisabled();
  });

  it('enables Firestore test button when user is signed in', () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
      },
      uid: 'test-uid',
      loading: false,
      error: null,
      getIdToken: vi.fn().mockResolvedValue('test-token'),
    });

    render(<TestApp />);
    const firestoreButton = screen.getByRole('button', { name: /Test Firestore Connectivity/i });
    expect(firestoreButton).not.toBeDisabled();
  });

  it('renders verbose logging toggle', () => {
    render(<TestApp />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(screen.getByText(/Enable verbose console logging/i)).toBeInTheDocument();
  });

  it('toggles verbose logging when checkbox is clicked', () => {
    render(<TestApp />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('shows empty state when no API calls have been made', () => {
    render(<TestApp />);
    expect(screen.getByText(/No API calls yet/i)).toBeInTheDocument();
  });

  it('calls Dungeon Master health endpoint and displays success result', async () => {
    const mockResponse = { status: 'healthy', service: 'dungeon-master' };
    mockHealthCheckHealthGet.mockResolvedValue(mockResponse);

    render(<TestApp />);

    const button = screen.getByRole('button', { name: /Test Dungeon Master \/health/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockHealthCheckHealthGet).toHaveBeenCalledTimes(1);
      expect(screen.getAllByText('SUCCESS').length).toBeGreaterThan(0);
    });
  });

  it('calls Journey Log health endpoint and displays success result', async () => {
    const mockResponse = { status: 'healthy', service: 'journey-log' };
    mockHealthHealthGet.mockResolvedValue(mockResponse);

    render(<TestApp />);

    const button = screen.getByRole('button', { name: /Test Journey Log \/health/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockHealthHealthGet).toHaveBeenCalledTimes(1);
      expect(screen.getAllByText('SUCCESS').length).toBeGreaterThan(0);
    });
  });

  it('calls Journey Log info endpoint and displays success result', async () => {
    const mockResponse = { version: '1.0.0', build: 'test-build' };
    mockInfoInfoGet.mockResolvedValue(mockResponse);

    render(<TestApp />);

    const button = screen.getByRole('button', { name: /Test Journey Log \/info/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockInfoInfoGet).toHaveBeenCalledTimes(1);
      expect(screen.getAllByText('SUCCESS').length).toBeGreaterThan(0);
    });
  });

  it('displays error result when API call fails', async () => {
    const mockError = new Error('Network error');
    mockHealthCheckHealthGet.mockRejectedValue(mockError);

    render(<TestApp />);

    const button = screen.getByRole('button', { name: /Test Dungeon Master \/health/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('ERROR')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays masked authorization header when user is authenticated', async () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
      },
      uid: 'test-uid',
      loading: false,
      error: null,
      getIdToken: vi.fn().mockResolvedValue(mockToken),
    });

    const mockResponse = { status: 'healthy' };
    mockHealthCheckHealthGet.mockResolvedValue(mockResponse);

    render(<TestApp />);

    const button = screen.getByRole('button', { name: /Test Dungeon Master \/health/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Authorization:')).toBeInTheDocument();
      // Should show masked token
      const maskedToken = screen.getByText(/Bearer eyJh\.\.\.ture/i);
      expect(maskedToken).toBeInTheDocument();
    });
  });

  it('displays X-User-Id header for Journey Log requests when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-uid-123',
        email: 'test@example.com',
      },
      uid: 'test-uid-123',
      loading: false,
      error: null,
      getIdToken: vi.fn().mockResolvedValue('test-token'),
    });

    const mockResponse = { status: 'healthy' };
    mockHealthHealthGet.mockResolvedValue(mockResponse);

    render(<TestApp />);

    const button = screen.getByRole('button', { name: /Test Journey Log \/health/i });
    fireEvent.click(button);

    await waitFor(() => {
      const userIdHeaders = screen.getAllByText('X-User-Id:');
      expect(userIdHeaders.length).toBeGreaterThan(0);
      const userIdValues = screen.getAllByText('test-uid-123');
      expect(userIdValues.length).toBeGreaterThan(0);
    });
  });

  it('clears results when clear button is clicked', async () => {
    const mockResponse = { status: 'healthy' };
    mockHealthCheckHealthGet.mockResolvedValue(mockResponse);

    render(<TestApp />);

    // Make an API call
    const testButton = screen.getByRole('button', { name: /Test Dungeon Master \/health/i });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('SUCCESS')).toBeInTheDocument();
    });

    // Clear results
    const clearButton = screen.getByRole('button', { name: /Clear Results/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText('SUCCESS')).not.toBeInTheDocument();
      expect(screen.getByText(/No API calls yet/i)).toBeInTheDocument();
    });
  });

  it('displays response data as formatted JSON', async () => {
    const mockResponse = {
      status: 'healthy',
      version: '1.0.0',
      uptime: 12345,
    };
    mockHealthCheckHealthGet.mockResolvedValue(mockResponse);

    render(<TestApp />);

    const button = screen.getByRole('button', { name: /Test Dungeon Master \/health/i });
    fireEvent.click(button);

    await waitFor(() => {
      const jsonElement = screen.getByText(/"status": "healthy"/);
      expect(jsonElement).toBeInTheDocument();
    });
  });

  it('keeps last 10 results and removes older ones', async () => {
    const mockResponse = { status: 'healthy' };
    mockHealthCheckHealthGet.mockResolvedValue(mockResponse);

    render(<TestApp />);

    const button = screen.getByRole('button', { name: /Test Dungeon Master \/health/i });

    // Click 12 times to generate 12 results
    for (let i = 0; i < 12; i++) {
      fireEvent.click(button);
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => expect(mockHealthCheckHealthGet).toHaveBeenCalledTimes(i + 1));
    }

    // Should only see 10 result items (since loading state is also logged, we need to check total items)
    await waitFor(() => {
      const resultItems = screen.getAllByText(/Dungeon Master/).filter(el => 
        el.className === 'debug-result-service'
      );
      expect(resultItems.length).toBeLessThanOrEqual(10);
    });
  });

  it('handles API calls with no authentication token', async () => {
    const mockResponse = { status: 'healthy' };
    mockHealthCheckHealthGet.mockResolvedValue(mockResponse);

    mockUseAuth.mockReturnValue({
      user: null,
      uid: null,
      loading: false,
      error: null,
      getIdToken: vi.fn().mockResolvedValue(null),
    });

    render(<TestApp />);

    const button = screen.getByRole('button', { name: /Test Dungeon Master \/health/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockHealthCheckHealthGet).toHaveBeenCalledTimes(1);
      expect(screen.getByText('SUCCESS')).toBeInTheDocument();
      // Should not show Authorization header when no token
      expect(screen.queryByText('Authorization:')).not.toBeInTheDocument();
    });
  });
});
