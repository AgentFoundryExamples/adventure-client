import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import GamePage from '../GamePage';
import type { GetNarrativeResponse, NarrativeTurn } from '@/api';

// Mock the API
const mockGetCharacterLastTurn = vi.fn();
vi.mock('@/api', () => ({
  getCharacterLastTurn: (characterId: string) => mockGetCharacterLastTurn(characterId),
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
  });

  describe('Parameter Validation', () => {
    it('redirects to /app when characterId is missing', async () => {
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);
      
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

    it('calls getCharacterLastTurn with valid characterId', async () => {
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);
      
      renderWithRoute('char-valid-123');

      await waitFor(() => {
        expect(mockGetCharacterLastTurn).toHaveBeenCalledWith('char-valid-123');
      });
    });

    it('fetches data exactly once per characterId', async () => {
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);
      
      renderWithRoute('char-123');

      await waitFor(() => {
        expect(mockGetCharacterLastTurn).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Loading State', () => {
    it('displays loading spinner while fetching turn', async () => {
      mockGetCharacterLastTurn.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRoute();

      expect(screen.getByText('Loading last turn...')).toBeInTheDocument();
      expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when fetch fails', async () => {
      const errorMessage = 'Network error';
      mockGetCharacterLastTurn.mockRejectedValue(new Error(errorMessage));

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Last Turn')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('displays generic error message for non-Error exceptions', async () => {
      mockGetCharacterLastTurn.mockRejectedValue('Unknown error');

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Last Turn')).toBeInTheDocument();
        expect(screen.getByText('Failed to load last turn')).toBeInTheDocument();
      });
    });

    it('handles 404 error with specific message', async () => {
      const error404 = new Error('Not found') as Error & { status: number };
      error404.status = 404;
      mockGetCharacterLastTurn.mockRejectedValue(error404);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Character not found')).toBeInTheDocument();
      });
    });

    it('handles 401 error with auth prompt', async () => {
      const error401 = new Error('Unauthorized') as Error & { status: number };
      error401.status = 401;
      mockGetCharacterLastTurn.mockRejectedValue(error401);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Unauthorized. Please log in again.')).toBeInTheDocument();
        expect(screen.getByText('Go to Login')).toBeInTheDocument();
      });
    });

    it('handles 403 error with auth prompt', async () => {
      const error403 = new Error('Forbidden') as Error & { status: number };
      error403.status = 403;
      mockGetCharacterLastTurn.mockRejectedValue(error403);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Unauthorized. Please log in again.')).toBeInTheDocument();
        expect(screen.getByText('Go to Login')).toBeInTheDocument();
      });
    });

    it('navigates to login on auth error button click', async () => {
      const error401 = new Error('Unauthorized') as Error & { status: number };
      error401.status = 401;
      mockGetCharacterLastTurn.mockRejectedValue(error401);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Go to Login')).toBeInTheDocument();
      });

      const loginButton = screen.getByText('Go to Login');
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('allows retry after error', async () => {
      mockGetCharacterLastTurn
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponseWithTurn);

      renderWithRoute();

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Last Turn')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      // Should show loading then success
      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
        expect(screen.getByText('Last Dungeon Master Response')).toBeInTheDocument();
      });

      expect(mockGetCharacterLastTurn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no turns exist', async () => {
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseEmpty);

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
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseEmpty);

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
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
      });

      // Check DM section
      expect(screen.getByText('Last Dungeon Master Response')).toBeInTheDocument();
      expect(screen.getByText(mockTurn.gm_response)).toBeInTheDocument();

      // Check Player section
      expect(screen.getByText('Your Last Action')).toBeInTheDocument();
      expect(screen.getByText(mockTurn.player_action)).toBeInTheDocument();
    });

    it('displays timestamp when provided', async () => {
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
      });

      // Check timestamp is displayed and formatted
      expect(screen.getByText('Time:')).toBeInTheDocument();
      const timestampElements = screen.getAllByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
      expect(timestampElements.length).toBeGreaterThan(0);
    });

    it('handles missing player action gracefully', async () => {
      const turnWithoutPlayerAction: NarrativeTurn = {
        ...mockTurn,
        player_action: '',
      };
      
      mockGetCharacterLastTurn.mockResolvedValue({
        turns: [turnWithoutPlayerAction],
        metadata: mockResponseWithTurn.metadata,
      });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
      });

      // Check placeholder message
      expect(screen.getByText('No player action recorded for this turn.')).toBeInTheDocument();
    });

    it('displays back to characters button in header', async () => {
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
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
      
      mockGetCharacterLastTurn.mockResolvedValue({
        turns: [turnWithInvalidTimestamp],
        metadata: mockResponseWithTurn.metadata,
      });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
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
      
      mockGetCharacterLastTurn.mockResolvedValue({
        turns: [turnWithNullFields],
        metadata: mockResponseWithTurn.metadata,
      });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
        expect(screen.getByText(mockTurn.gm_response)).toBeInTheDocument();
      });
    });

    it('handles component unmount gracefully', async () => {
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);

      const { unmount } = renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
      });

      expect(() => unmount()).not.toThrow();
    });

    it('prevents multiple fetches for same characterId', async () => {
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute('char-123');

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
      });

      // Should only call once despite multiple renders
      expect(mockGetCharacterLastTurn).toHaveBeenCalledTimes(1);
      expect(mockGetCharacterLastTurn).toHaveBeenCalledWith('char-123');
    });
  });

  describe('Turn Sections Structure', () => {
    it('renders both turn sections with correct CSS classes', async () => {
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
      });

      const dmSection = document.querySelector('.dm-section');
      const playerSection = document.querySelector('.player-section');
      
      expect(dmSection).toBeInTheDocument();
      expect(playerSection).toBeInTheDocument();
    });

    it('renders turn content with proper structure', async () => {
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
      });

      const turnContainer = document.querySelector('.turn-container');
      expect(turnContainer).toBeInTheDocument();
      
      const turnSections = document.querySelectorAll('.turn-section');
      expect(turnSections).toHaveLength(2);
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
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
      });

      expect(screen.getByText(initialScenario.narrative)).toBeInTheDocument();
      
      // Should NOT call the API since we have initial scenario
      expect(mockGetCharacterLastTurn).not.toHaveBeenCalled();
    });

    it('clears navigation state after using initial scenario', async () => {
      const initialScenario = {
        narrative: 'You awaken in a mysterious forest.',
        character_id: 'char-123',
      };

      renderWithRoute('char-123', { initialScenario });

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
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

      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute('char-123', { initialScenario });

      // Should fetch from API since character_id doesn't match
      await waitFor(() => {
        expect(mockGetCharacterLastTurn).toHaveBeenCalledWith('char-123');
      });

      // Should display the fetched turn, not the initial scenario
      await waitFor(() => {
        expect(screen.getByText(mockTurn.gm_response)).toBeInTheDocument();
      });
    });

    it('falls back to API fetch when initial scenario is missing', async () => {
      mockGetCharacterLastTurn.mockResolvedValue(mockResponseWithTurn);

      renderWithRoute('char-123');

      // Should fetch from API
      await waitFor(() => {
        expect(mockGetCharacterLastTurn).toHaveBeenCalledWith('char-123');
      });

      await waitFor(() => {
        expect(screen.getByText(mockTurn.gm_response)).toBeInTheDocument();
      });
    });

    it('displays no player action placeholder for initial scenario', async () => {
      const initialScenario = {
        narrative: 'You awaken in a mysterious forest.',
        character_id: 'char-123',
      };

      renderWithRoute('char-123', { initialScenario });

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
      });

      // Initial scenario has no player action, should show placeholder
      expect(screen.getByText('No player action recorded for this turn.')).toBeInTheDocument();
    });

    it('prevents duplicate journey-log requests when initial scenario provided', async () => {
      const initialScenario = {
        narrative: 'You awaken in a mysterious forest.',
        character_id: 'char-123',
      };

      renderWithRoute('char-123', { initialScenario });

      await waitFor(() => {
        expect(screen.getByText('Last Turn')).toBeInTheDocument();
      });

      // Verify the initial scenario was used without API call
      expect(mockGetCharacterLastTurn).not.toHaveBeenCalled();
      
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
      mockGetCharacterLastTurn.mockRejectedValue(error);

      renderWithRoute('char-123', { initialScenario });

      // Should attempt to fetch from API since character_id doesn't match
      await waitFor(() => {
        expect(mockGetCharacterLastTurn).toHaveBeenCalledWith('char-123');
      });

      // Should display error state
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Last Turn')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch turns')).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('handles empty journey-log response after fallback', async () => {
      mockGetCharacterLastTurn.mockResolvedValue({
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
        expect(mockGetCharacterLastTurn).toHaveBeenCalledWith('char-123');
      });

      // Should display empty state
      await waitFor(() => {
        expect(screen.getByText('No Turns Yet')).toBeInTheDocument();
        expect(screen.getByText("This character doesn't have any recorded turns yet.")).toBeInTheDocument();
      });
    });
  });
});
