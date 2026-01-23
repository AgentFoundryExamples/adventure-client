import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import GamePage from '../GamePage';
import type { GetNarrativeResponse, NarrativeTurn } from '@/api';

// Mock config module - must be defined inline for vi.mock hoisting
vi.mock('@/config/env', () => ({
  config: {
    dungeonMasterApiUrl: 'http://localhost:8000',
    journeyLogApiUrl: 'http://localhost:8001',
    firebase: {
      apiKey: 'test-api-key',
      authDomain: 'test-auth-domain.firebaseapp.com',
      projectId: 'test-project-id',
      storageBucket: 'test-bucket.appspot.com',
      messagingSenderId: '123456789',
      appId: 'test-app-id',
      measurementId: 'test-measurement-id',
    },
    isDevelopment: true,
    isProduction: false,
  },
}));

// Mock the API
const mockGetCharacterLastTurn = vi.fn();
const mockSubmitTurn = vi.fn();
const mockGetNarrativeTurns = vi.fn();
const mockAppendNarrativeTurn = vi.fn();

vi.mock('@/api', () => ({
  getCharacterLastTurn: (characterId: string) => mockGetCharacterLastTurn(characterId),
  submitTurn: (request: { character_id: string; user_action: string }) => mockSubmitTurn(request),
  CharactersService: {
    getNarrativeTurnsCharactersCharacterIdNarrativeGet: (params: { characterId: string; n: number; xUserId: string | null }) => mockGetNarrativeTurns(params),
    appendNarrativeTurnCharactersCharacterIdNarrativePost: (params: { characterId: string; xUserId: string; requestBody: { user_action: string; ai_response: string } }) => mockAppendNarrativeTurn(params),
  },
}));

// Mock useAuth hook
const mockGetIdToken = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', email: 'test@example.com' },
    uid: 'test-user-id',
    loading: false,
    error: null,
    getIdToken: mockGetIdToken,
    signInWithEmailPassword: vi.fn(),
    signUpWithEmailPassword: vi.fn(),
    signOutUser: vi.fn(),
    signInWithGoogle: vi.fn(),
  }),
}));

// Mock navigate
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
      <Routes>
        <Route path="/game/:characterId" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

interface LocationStateForTest {
  initialScenario?: {
    narrative: string;
    character_id: string;
  };
}

function renderWithRoute(characterId: string = 'char-123', state?: LocationStateForTest) {
  if (state) {
    // Use MemoryRouter when we need to pass state
    const initialEntry = {
      pathname: `/game/${characterId}`,
      state: state
    };
    
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/game/:characterId" element={<GamePage />} />
        </Routes>
      </MemoryRouter>
    );
  }
  
  // Use standard BrowserRouter for regular tests
  window.history.pushState({}, '', `/game/${characterId}`);
  return render(<TestApp />);
}

const mockTurn: NarrativeTurn = {
  turn_id: 'turn-123',
  turn_number: 5,
  player_action: 'I search the ancient temple for hidden treasures.',
  gm_response: 'As you carefully search through the dusty corridors, your keen eyes spot a glimmering amulet hidden behind a loose stone.',
  timestamp: '2025-01-15T14:30:00Z',
  game_state_snapshot: {},
  metadata: {},
};

const mockResponseWithTurn: GetNarrativeResponse = {
  turns: [mockTurn],
  metadata: {
    requested_n: 1,
    returned_count: 1,
    total_available: 5,
  },
};

const mockResponseEmpty: GetNarrativeResponse = {
  turns: [],
  metadata: {
    requested_n: 1,
    returned_count: 0,
    total_available: 0,
  },
};

describe('GamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetIdToken.mockResolvedValue('test-firebase-token');
    
    // Set default mock behaviors
    mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
    mockAppendNarrativeTurn.mockResolvedValue({
      turn: mockTurn,
      total_turns: 6,
    });
  });

  describe('Parameter Validation', () => {
    it('redirects to /app when characterId is missing', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      
      window.history.pushState({}, '', '/game/');
      render(
        <BrowserRouter>
          <Routes>
            <Route path="/game/" element={<GamePage />} />
          </Routes>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app');
      });
    });

    it('calls CharactersService with valid characterId', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      
      renderWithRoute('char-valid-123');

      await waitFor(() => {
        expect(mockGetNarrativeTurns).toHaveBeenCalledWith({
          characterId: 'char-valid-123',
          n: 10,
          xUserId: 'test-user-id',
        });
      });
    });

    it('fetches data exactly once per characterId', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      
      renderWithRoute('char-123');

      await waitFor(() => {
        expect(mockGetNarrativeTurns).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Loading State', () => {
    it('displays loading spinner while fetching turn', async () => {
      mockGetNarrativeTurns.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRoute();

      expect(screen.getByText('Loading game state...')).toBeInTheDocument();
      // Loading spinner has the class, not an explicit element
      const loadingContainer = document.querySelector('.loading-container');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when fetch fails', async () => {
      const errorMessage = 'Network error';
      mockGetNarrativeTurns.mockRejectedValue(new Error(errorMessage));

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Game')).toBeInTheDocument();
        // getFriendlyErrorMessage adds context prefix "Failed to load game state:"
        expect(screen.getByText(/Network error\. Please check your internet connection\./)).toBeInTheDocument();
      });
    });

    it('displays generic error message for non-Error exceptions', async () => {
      mockGetNarrativeTurns.mockRejectedValue('Unknown error');

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Game')).toBeInTheDocument();
        // getFriendlyErrorMessage returns a generic message for unknown errors
        expect(screen.getByText(/An unexpected error occurred\./)).toBeInTheDocument();
      });
    });

    it('handles 404 error with specific message', async () => {
      const error404 = new Error('Not found') as Error & { status: number };
      error404.status = 404;
      mockGetNarrativeTurns.mockRejectedValue(error404);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Game')).toBeInTheDocument();
        expect(screen.getByText(/Character not found/)).toBeInTheDocument();
      });
    });

    it('handles 401 error with auth prompt', async () => {
      const error401 = new Error('Unauthorized') as Error & { status: number };
      error401.status = 401;
      mockGetNarrativeTurns.mockRejectedValue(error401);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Game')).toBeInTheDocument();
        // getFriendlyErrorMessage maps 401 to "Authentication failed"
        expect(screen.getByText(/Authentication failed/)).toBeInTheDocument();
        expect(screen.getByText('Go to Login')).toBeInTheDocument();
      });
    });

    it('handles 403 error by redirecting to /app', async () => {
      const error403 = new Error('Forbidden') as Error & { status: number };
      error403.status = 403;
      mockGetNarrativeTurns.mockRejectedValue(error403);

      renderWithRoute();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app', {
          replace: true,
          state: {
            message: 'Access denied. You do not have permission to view this character.',
            severity: 'error'
          }
        });
      });
    });

    it('navigates to login on auth error button click', async () => {
      const error401 = new Error('Unauthorized') as Error & { status: number };
      error401.status = 401;
      mockGetNarrativeTurns.mockRejectedValue(error401);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Go to Login')).toBeInTheDocument();
      });

      const loginButton = screen.getByText('Go to Login');
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('allows retry after error', async () => {
      mockGetNarrativeTurns
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponseWithTurn);

      renderWithRoute();

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Game')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      // Should show loading then success
      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
        expect(screen.getByText('Current Scene')).toBeInTheDocument();
      });

      expect(mockGetNarrativeTurns).toHaveBeenCalledTimes(2);
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no turns exist', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseEmpty);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('No Turns Yet')).toBeInTheDocument();
        expect(screen.getByText("This character doesn't have any recorded turns yet.")).toBeInTheDocument();
        expect(screen.getByText('Gameplay will resume once a new turn exists.')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back to Characters');
      expect(backButton).toBeInTheDocument();
    });

    it('navigates back to app on back button click', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseEmpty);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('No Turns Yet')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back to Characters');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  });

  describe('Success State - Turn Display', () => {
    it('renders DM response and player action correctly', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      // Check current scenario is displayed
      expect(screen.getByText('Current Scene')).toBeInTheDocument();
      const dmResponses = screen.getAllByText(mockTurn.gm_response);
      expect(dmResponses.length).toBeGreaterThan(0); // Can appear in both current scene and history

      // Check turn history shows player action and DM response
      expect(screen.getByText('Recent Actions')).toBeInTheDocument();
      expect(screen.getByText(mockTurn.player_action)).toBeInTheDocument();
    });

    it('displays timestamp when provided', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      // Check timestamp is displayed and formatted in history
      const timestampElements = screen.getAllByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
      expect(timestampElements.length).toBeGreaterThan(0);
    });

    it('handles missing player action gracefully', async () => {
      const turnWithoutPlayerAction: NarrativeTurn = {
        ...mockTurn,
        player_action: '',
      };
      
      mockGetNarrativeTurns.mockResolvedValue({
        turns: [turnWithoutPlayerAction],
        metadata: mockResponseWithTurn.metadata,
      });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      // When there's no player action, history section should not appear
      expect(screen.queryByText('Recent Actions')).not.toBeInTheDocument();
    });

    it('displays back to characters button in header', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const backButtons = screen.getAllByText('Back to Characters');
      expect(backButtons.length).toBeGreaterThan(0);
      
      fireEvent.click(backButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid timestamp gracefully', async () => {
      const turnWithInvalidTimestamp: NarrativeTurn = {
        ...mockTurn,
        timestamp: 'invalid-timestamp',
      };
      
      mockGetNarrativeTurns.mockResolvedValue({
        turns: [turnWithInvalidTimestamp],
        metadata: mockResponseWithTurn.metadata,
      });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      // Should display the raw string if formatting fails
      expect(screen.getByText('invalid-timestamp')).toBeInTheDocument();
    });

    it('handles turn with null metadata fields', async () => {
      const turnWithNullFields: NarrativeTurn = {
        ...mockTurn,
        turn_number: null,
        game_state_snapshot: null,
        metadata: null,
      };
      
      mockGetNarrativeTurns.mockResolvedValue({
        turns: [turnWithNullFields],
        metadata: mockResponseWithTurn.metadata,
      });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
        const dmResponses = screen.getAllByText(mockTurn.gm_response);
        expect(dmResponses.length).toBeGreaterThan(0);
      });
    });

    it('handles component unmount gracefully', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);

      const { unmount } = renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      expect(() => unmount()).not.toThrow();
    });

    it('prevents multiple fetches for same characterId', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute('char-123');

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      // Should only call once despite multiple renders
      expect(mockGetNarrativeTurns).toHaveBeenCalledTimes(1);
      expect(mockGetNarrativeTurns).toHaveBeenCalledWith({ characterId: 'char-123', n: 10, xUserId: 'test-user-id' });
    });
  });

  describe('Action Submission', () => {
    it('allows submitting an action when textarea has content', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      mockSubmitTurn.mockResolvedValue({
        narrative: 'You pick up the amulet. It glows with an ancient power.',
      });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);
      const actButton = screen.getByText('Act');

      // Button should be disabled when textarea is empty
      expect(actButton).toBeDisabled();

      // Type an action
      fireEvent.change(textarea, { target: { value: 'I pick up the amulet' } });

      // Button should now be enabled
      await waitFor(() => {
        expect(actButton).not.toBeDisabled();
      });

      // Click the Act button
      fireEvent.click(actButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });

      // Should call submitTurn with correct parameters
      await waitFor(() => {
        expect(mockSubmitTurn).toHaveBeenCalledWith({
          character_id: 'char-123',
          user_action: 'I pick up the amulet',
        });
      });

      // Should update the scenario with new narrative
      await waitFor(() => {
        const newNarrative = screen.getAllByText('You pick up the amulet. It glows with an ancient power.');
        expect(newNarrative.length).toBeGreaterThan(0);
      });

      // Textarea should be cleared
      expect(textarea).toHaveValue('');
    });

    it('submits action with Ctrl+Enter keyboard shortcut', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      mockSubmitTurn.mockResolvedValue({
        narrative: 'You examine the amulet closely.',
      });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);

      // Type an action
      fireEvent.change(textarea, { target: { value: 'I examine the amulet' } });

      // Press Ctrl+Enter
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      // Should call submitTurn
      await waitFor(() => {
        expect(mockSubmitTurn).toHaveBeenCalledWith({
          character_id: 'char-123',
          user_action: 'I examine the amulet',
        });
      });
    });

    it('prevents submission while request is in progress', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      let resolveSubmit: (value: { narrative: string }) => void;
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });
      mockSubmitTurn.mockReturnValue(submitPromise);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);
      const actButton = screen.getByText('Act');

      // Type an action
      fireEvent.change(textarea, { target: { value: 'I attack the goblin' } });

      // Click the Act button
      fireEvent.click(actButton);

      // Button should be disabled during submission
      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });

      // Try to click again - should not trigger another submission
      fireEvent.click(actButton);

      // Should only have been called once
      expect(mockSubmitTurn).toHaveBeenCalledTimes(1);

      // Resolve the promise
      resolveSubmit!({ narrative: 'You strike the goblin!' });

      await waitFor(() => {
        const newNarrative = screen.getAllByText('You strike the goblin!');
        expect(newNarrative.length).toBeGreaterThan(0);
      });
    });

    it('handles submission error gracefully', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      mockSubmitTurn.mockRejectedValue(new Error('Failed to process turn'));

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);
      const actButton = screen.getByText('Act');

      // Type an action
      fireEvent.change(textarea, { target: { value: 'I cast a spell' } });

      // Click the Act button
      fireEvent.click(actButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to process turn/)).toBeInTheDocument();
      });

      // Textarea should still contain the action (not cleared)
      expect(textarea).toHaveValue('I cast a spell');

      // Previous scenario should still be displayed
      const dmResponses = screen.getAllByText(mockTurn.gm_response);
      expect(dmResponses.length).toBeGreaterThan(0);
    });

    it('handles authentication error during submission', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      const authError = new Error('Unauthorized') as Error & { status: number };
      authError.status = 401;
      mockSubmitTurn.mockRejectedValue(authError);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);

      // Type an action
      fireEvent.change(textarea, { target: { value: 'I open the door' } });

      // Submit
      fireEvent.click(screen.getByText('Act'));

      // Should show auth error message
      await waitFor(() => {
        expect(screen.getByText(/Authentication failed/)).toBeInTheDocument();
      });
    });

    it('handles rate limit error during submission', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      const rateLimitError = new Error('Too many requests') as Error & { status: number };
      rateLimitError.status = 429;
      mockSubmitTurn.mockRejectedValue(rateLimitError);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);

      // Type an action
      fireEvent.change(textarea, { target: { value: 'I run away' } });

      // Submit
      fireEvent.click(screen.getByText('Act'));

      // Should show rate limit error message
      await waitFor(() => {
        expect(screen.getByText(/Too many requests/)).toBeInTheDocument();
      });
    });

    it('adds new turn to history after successful submission', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      mockSubmitTurn.mockResolvedValue({
        narrative: 'You successfully pick up the amulet.',
      });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      // Should show existing turn in history
      expect(screen.getByText(mockTurn.player_action)).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText(/Describe your action/);

      // Submit new action
      fireEvent.change(textarea, { target: { value: 'I pick up the amulet' } });
      fireEvent.click(screen.getByText('Act'));

      // Wait for submission to complete
      await waitFor(() => {
        const newNarrative = screen.getAllByText('You successfully pick up the amulet.');
        expect(newNarrative.length).toBeGreaterThan(0);
      });

      // Both actions should now be in history
      expect(screen.getByText(mockTurn.player_action)).toBeInTheDocument();
      expect(screen.getByText('I pick up the amulet')).toBeInTheDocument();
    });
  });

  describe('Turn Sections Structure', () => {
    it('renders gameplay sections with correct structure', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const scenarioSection = document.querySelector('.current-scenario-section');
      const historySection = document.querySelector('.turn-history-section');
      const actionSection = document.querySelector('.action-input-section');
      
      expect(scenarioSection).toBeInTheDocument();
      expect(historySection).toBeInTheDocument();
      expect(actionSection).toBeInTheDocument();
    });

    it('renders action input form with textarea and button', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = document.querySelector('.action-textarea');
      const actButton = screen.getByText('Act');
      
      expect(textarea).toBeInTheDocument();
      expect(actButton).toBeInTheDocument();
    });
  });

  describe('Initial Scenario from Navigation State', () => {
    it('displays initial scenario from navigation state without fetching', async () => {
      const initialScenario = {
        narrative: 'You awaken in a mysterious forest, sunlight filtering through ancient trees.',
        character_id: 'char-123',
      };

      renderWithRoute('char-123', { initialScenario });

      // Should display the initial scenario immediately
      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      expect(screen.getByText(initialScenario.narrative)).toBeInTheDocument();
      
      // Should NOT call the API since we have initial scenario
      expect(mockGetNarrativeTurns).not.toHaveBeenCalled();
    });

    it('clears navigation state after using initial scenario', async () => {
      const initialScenario = {
        narrative: 'You awaken in a mysterious forest.',
        character_id: 'char-123',
      };

      renderWithRoute('char-123', { initialScenario });

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      // Should have cleared the state by calling navigate with null state
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/game/char-123',
          { replace: true, state: null }
        );
      });
    });

    it('ignores initial scenario if character_id does not match', async () => {
      const initialScenario = {
        narrative: 'You awaken in a mysterious forest.',
        character_id: 'char-different',
      };

      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute('char-123', { initialScenario });

      // Should fetch from API since character_id doesn't match
      await waitFor(() => {
        expect(mockGetNarrativeTurns).toHaveBeenCalledWith({ characterId: 'char-123', n: 10, xUserId: 'test-user-id' });
      });

      // Should display the fetched turn, not the initial scenario
      await waitFor(() => {
        const dmResponses = screen.getAllByText(mockTurn.gm_response);
        expect(dmResponses.length).toBeGreaterThan(0);
      });
    });

    it('falls back to API fetch when initial scenario is missing', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute('char-123');

      // Should fetch from API
      await waitFor(() => {
        expect(mockGetNarrativeTurns).toHaveBeenCalledWith({ characterId: 'char-123', n: 10, xUserId: 'test-user-id' });
      });

      await waitFor(() => {
        const dmResponses = screen.getAllByText(mockTurn.gm_response);
        expect(dmResponses.length).toBeGreaterThan(0);
      });
    });

    it('displays no turn history for initial scenario', async () => {
      const initialScenario = {
        narrative: 'You awaken in a mysterious forest.',
        character_id: 'char-123',
      };

      renderWithRoute('char-123', { initialScenario });

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      // Initial scenario has no player action, should not show history
      expect(screen.queryByText('Recent Actions')).not.toBeInTheDocument();
    });

    it('prevents duplicate journey-log requests when initial scenario provided', async () => {
      const initialScenario = {
        narrative: 'You awaken in a mysterious forest.',
        character_id: 'char-123',
      };

      renderWithRoute('char-123', { initialScenario });

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      // Verify the initial scenario was used without API call
      expect(mockGetNarrativeTurns).not.toHaveBeenCalled();
      
      // Verify navigate was called to clear the state
      expect(mockNavigate).toHaveBeenCalledWith(
        '/game/char-123',
        { replace: true, state: null }
      );
      
      // Since the state is cleared and memoized, subsequent renders won't re-trigger the effect
      // The useMemo with location.state dependency ensures the initial scenario is only processed once
    });

    it('handles journey-log fetch error after ignoring mismatched character_id', async () => {
      const initialScenario = {
        narrative: 'You awaken in a mysterious forest.',
        character_id: 'char-different',
      };

      const error = new Error('Failed to fetch turns');
      mockGetNarrativeTurns.mockRejectedValue(error);

      renderWithRoute('char-123', { initialScenario });

      // Should attempt to fetch from API since character_id doesn't match
      await waitFor(() => {
        expect(mockGetNarrativeTurns).toHaveBeenCalledWith({ characterId: 'char-123', n: 10, xUserId: 'test-user-id' });
      });

      // Should display error state
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Game')).toBeInTheDocument();
        // The error message is transformed by getFriendlyErrorMessage
        expect(screen.getByText(/Network error\. Please check your internet connection\./)).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('handles empty journey-log response after fallback', async () => {
      mockGetNarrativeTurns.mockResolvedValue({
        turns: [],
        metadata: {
          requested_n: 1,
          returned_count: 0,
          total_available: 0,
        },
      });

      renderWithRoute('char-123');

      // Should fetch from API
      await waitFor(() => {
        expect(mockGetNarrativeTurns).toHaveBeenCalledWith({ characterId: 'char-123', n: 10, xUserId: 'test-user-id' });
      });

      // Should display empty state
      await waitFor(() => {
        expect(screen.getByText('No Turns Yet')).toBeInTheDocument();
        expect(screen.getByText("This character doesn't have any recorded turns yet.")).toBeInTheDocument();
      });
    });
  });

  describe('Advanced Action Submission Edge Cases', () => {
    it('handles transient error on action submission with retry', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      
      // First submission fails with 500, second succeeds
      const error500 = { status: 500, message: 'Internal Server Error' } as Error & { status: number };
      mockSubmitTurn
        .mockRejectedValueOnce(error500)
        .mockResolvedValueOnce({
          narrative: 'You pick up the amulet successfully.',
        });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);
      
      // Submit action
      fireEvent.change(textarea, { target: { value: 'I pick up the amulet' } });
      fireEvent.click(screen.getByText('Act'));

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/Server error/)).toBeInTheDocument();
      });

      // Textarea should retain value for retry
      expect(textarea).toHaveValue('I pick up the amulet');

      // Retry submission
      fireEvent.click(screen.getByText('Act'));

      // Should succeed on retry
      await waitFor(() => {
        const successText = screen.getAllByText('You pick up the amulet successfully.');
        expect(successText.length).toBeGreaterThan(0);
      });

      // Textarea should be cleared after success
      expect(textarea).toHaveValue('');

      // Should have called submitTurn twice (initial + retry)
      expect(mockSubmitTurn).toHaveBeenCalledTimes(2);
    });

    it('prevents duplicate action submission during processing', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      
      let resolveSubmit: (value: { narrative: string }) => void;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      mockSubmitTurn.mockReturnValue(submitPromise);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);
      const actButton = screen.getByText('Act');
      
      // Submit action
      fireEvent.change(textarea, { target: { value: 'I attack' } });
      fireEvent.click(actButton);

      // Button should be disabled during submission
      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });

      // Try to submit again while processing
      fireEvent.click(actButton);
      fireEvent.click(actButton);

      // Should only call submitTurn once
      expect(mockSubmitTurn).toHaveBeenCalledTimes(1);

      // Resolve the promise
      resolveSubmit!({ narrative: 'You strike!' });

      await waitFor(() => {
        const strikeText = screen.getAllByText('You strike!');
        expect(strikeText.length).toBeGreaterThan(0);
      });

      // Still only called once
      expect(mockSubmitTurn).toHaveBeenCalledTimes(1);
    });

    it('handles journey-log persist failure gracefully', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      mockSubmitTurn.mockResolvedValue({
        narrative: 'The action succeeds.',
      });
      
      // Persist fails with 500 error
      const persistError = { status: 500, message: 'Failed to save' } as Error & { status: number };
      mockAppendNarrativeTurn.mockRejectedValue(persistError);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);
      
      // Submit action
      fireEvent.change(textarea, { target: { value: 'I test persistence' } });
      fireEvent.click(screen.getByText('Act'));

      // Should show the action result despite persist failure
      await waitFor(() => {
        const actionResult = screen.getAllByText('The action succeeds.');
        expect(actionResult.length).toBeGreaterThan(0);
      });

      // Should show a warning about persistence failure
      await waitFor(() => {
        expect(screen.getByText('Save Warning')).toBeInTheDocument();
        expect(screen.getByText(/Server error\. Please try again later/)).toBeInTheDocument();
      });

      // Action should still be in history despite persist failure
      expect(screen.getByText('I test persistence')).toBeInTheDocument();
    });

    it('handles 403 forbidden error on action submission with redirect', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      
      const error403 = { status: 403, message: 'Forbidden' } as Error & { status: number };
      mockSubmitTurn.mockRejectedValue(error403);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);
      
      // Submit action
      fireEvent.change(textarea, { target: { value: 'I try to act' } });
      fireEvent.click(screen.getByText('Act'));

      // Should redirect to /app with error message
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app', {
          replace: true,
          state: {
            message: 'Access denied. You do not have permission to interact with this character.',
            severity: 'error'
          }
        });
      });
    });

    it('limits turn history to MAX_HISTORY_SIZE', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      
      // Create a character with many turns already
      const manyTurns: NarrativeTurn[] = Array.from({ length: 25 }, (_, i) => ({
        turn_id: `turn-${i}`,
        turn_number: i + 1,
        player_action: `Action ${i}`,
        gm_response: `Response ${i}`,
        timestamp: '2025-01-15T14:30:00Z',
        game_state_snapshot: {},
        metadata: {},
      }));

      mockGetNarrativeTurns.mockResolvedValue({
        turns: manyTurns,
        metadata: {
          requested_n: 10,
          returned_count: 25,
          total_available: 25,
        },
      });

      mockSubmitTurn.mockResolvedValue({
        narrative: 'New action response',
      });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);
      
      // Submit one more action to exceed MAX_HISTORY_SIZE (20)
      fireEvent.change(textarea, { target: { value: 'Final action' } });
      fireEvent.click(screen.getByText('Act'));

      await waitFor(() => {
        const newResponse = screen.getAllByText('New action response');
        expect(newResponse.length).toBeGreaterThan(0);
      });

      // Check that history is capped - oldest entries should be removed
      // We can verify by checking the history section has at most 20 entries
      const historySection = document.querySelector('.turn-history-log');
      if (historySection) {
        const turnEntries = historySection.querySelectorAll('.history-turn-entry');
        expect(turnEntries.length).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('Race Condition Handling', () => {
    it('handles rapid character ID changes gracefully', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);

      const { rerender } = renderWithRoute('char-123');

      await waitFor(() => {
        expect(mockGetNarrativeTurns).toHaveBeenCalledWith({
          characterId: 'char-123',
          n: 10,
          xUserId: 'test-user-id',
        });
      });

      // Simulate navigation to different character
      window.history.pushState({}, '', '/game/char-456');
      
      // Component should handle the change gracefully
      // (In practice, React Router would remount the component)
      rerender(<TestApp />);

      // Should not throw errors
      expect(mockGetNarrativeTurns).toHaveBeenCalled();
    });

    it('handles component unmount during fetch', async () => {
      let resolveFetch: (value: GetNarrativeResponse) => void;
      const fetchPromise = new Promise<GetNarrativeResponse>(resolve => { resolveFetch = resolve; });
      mockGetNarrativeTurns.mockReturnValue(fetchPromise);

      const { unmount } = renderWithRoute();

      // Wait for fetch to start
      await waitFor(() => {
        expect(mockGetNarrativeTurns).toHaveBeenCalledTimes(1);
      });

      // Unmount before fetch completes
      unmount();

      // Resolve fetch after unmount
      resolveFetch!(mockResponseWithTurn);

      // Should not cause errors or warnings
      expect(() => unmount()).not.toThrow();
    });

    it('handles component unmount during action submission', async () => {
      mockGetNarrativeTurns.mockResolvedValue(mockResponseWithTurn);
      
      let resolveSubmit: (value: { narrative: string }) => void;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      mockSubmitTurn.mockReturnValue(submitPromise);

      const { unmount } = renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Adventure in Progress')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Describe your action/);
      
      // Start action submission
      fireEvent.change(textarea, { target: { value: 'I leave' } });
      fireEvent.click(screen.getByText('Act'));

      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });

      // Unmount during submission
      unmount();

      // Resolve after unmount
      resolveSubmit!({ narrative: 'Response after unmount' });

      // Should not cause errors
      expect(() => unmount()).not.toThrow();
    });
  });
});
