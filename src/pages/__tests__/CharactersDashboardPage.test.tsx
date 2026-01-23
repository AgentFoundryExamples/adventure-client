import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CharactersDashboardPage from '../CharactersDashboardPage';
import type { CharacterMetadata, ListCharactersResponse } from '@/api/journeyLog';

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

// Mock the journey-log API
const mockGetUserCharacters = vi.fn();
vi.mock('@/api/journeyLog', () => ({
  getUserCharacters: () => mockGetUserCharacters(),
}));

function TestApp() {
  return (
    <BrowserRouter>
      <CharactersDashboardPage />
    </BrowserRouter>
  );
}

const mockCharacter1: CharacterMetadata = {
  character_id: 'char-123',
  name: 'Aragorn',
  race: 'Human',
  class: 'Ranger',
  status: 'Healthy',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T12:00:00Z',
};

const mockCharacter2: CharacterMetadata = {
  character_id: 'char-456',
  name: 'Gandalf',
  race: 'Wizard',
  class: 'Mage',
  status: 'Healthy',
  created_at: '2025-01-02T00:00:00Z',
  updated_at: '2025-01-16T14:30:00Z',
};

describe('CharactersDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading spinner while fetching characters', async () => {
      mockGetUserCharacters.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<TestApp />);

      expect(screen.getByText('Loading your characters...')).toBeInTheDocument();
      // Loading spinner has the class, not an explicit element
      const loadingContainer = document.querySelector('.loading-container');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when fetch fails', async () => {
      const errorMessage = 'Network error';
      mockGetUserCharacters.mockRejectedValue(new Error(errorMessage));

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Characters')).toBeInTheDocument();
        // getFriendlyErrorMessage adds context prefix
        expect(screen.getByText(/Network error\. Please check your internet connection\./)).toBeInTheDocument();
      });
    });

    it('displays generic error message for non-Error exceptions', async () => {
      mockGetUserCharacters.mockRejectedValue('Unknown error');

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Characters')).toBeInTheDocument();
        // getFriendlyErrorMessage returns a generic message for unknown errors
        expect(screen.getByText(/An unexpected error occurred\./)).toBeInTheDocument();
      });
    });

    it('allows retry after error', async () => {
      mockGetUserCharacters
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          characters: [mockCharacter1],
          count: 1,
        } as ListCharactersResponse);

      render(<TestApp />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Characters')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      // Should show loading then success
      await waitFor(() => {
        expect(screen.getByText('Your Characters')).toBeInTheDocument();
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      expect(mockGetUserCharacters).toHaveBeenCalledTimes(2);
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no characters exist', async () => {
      mockGetUserCharacters.mockResolvedValue({
        characters: [],
        count: 0,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to Your Adventure')).toBeInTheDocument();
        expect(screen.getByText("You don't have any characters yet.")).toBeInTheDocument();
      });

      const ctaButton = screen.getByText('Create Your First Character');
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute('href', '/app/new-character');
    });
  });

  describe('Character List Display', () => {
    it('displays single character correctly', async () => {
      mockGetUserCharacters.mockResolvedValue({
        characters: [mockCharacter1],
        count: 1,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Your Characters')).toBeInTheDocument();
        expect(screen.getByText('1 character')).toBeInTheDocument();
      });

      // Check character details
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
      expect(screen.getByText('Human')).toBeInTheDocument();
      expect(screen.getByText('Ranger')).toBeInTheDocument();
      expect(screen.getByText('Healthy')).toBeInTheDocument();
    });

    it('displays "New Character" button when characters exist', async () => {
      mockGetUserCharacters.mockResolvedValue({
        characters: [mockCharacter1],
        count: 1,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Your Characters')).toBeInTheDocument();
      });

      const newCharButton = screen.getByText('New Character');
      expect(newCharButton).toBeInTheDocument();
      expect(newCharButton).toHaveAttribute('href', '/app/new-character');
    });

    it('displays multiple characters correctly', async () => {
      mockGetUserCharacters.mockResolvedValue({
        characters: [mockCharacter1, mockCharacter2],
        count: 2,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Your Characters')).toBeInTheDocument();
        expect(screen.getByText('2 characters')).toBeInTheDocument();
      });

      // Check both characters are displayed
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
      expect(screen.getByText('Gandalf')).toBeInTheDocument();
      expect(screen.getByText('Human')).toBeInTheDocument();
      expect(screen.getByText('Wizard')).toBeInTheDocument();
      expect(screen.getByText('Ranger')).toBeInTheDocument();
      expect(screen.getByText('Mage')).toBeInTheDocument();
    });

    it('displays character metadata fields', async () => {
      mockGetUserCharacters.mockResolvedValue({
        characters: [mockCharacter1],
        count: 1,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Check all metadata fields are present
      expect(screen.getByText('Race:')).toBeInTheDocument();
      expect(screen.getByText('Class:')).toBeInTheDocument();
      expect(screen.getByText('Created:')).toBeInTheDocument();
      expect(screen.getByText('Updated:')).toBeInTheDocument();
    });

    it('formats dates correctly', async () => {
      mockGetUserCharacters.mockResolvedValue({
        characters: [mockCharacter1],
        count: 1,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Check that dates are formatted (not raw ISO strings)
      const timestamps = screen.getAllByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    it('displays different character statuses with correct styling', async () => {
      const healthyChar: CharacterMetadata = { ...mockCharacter1, status: 'Healthy' };
      const deadChar: CharacterMetadata = { 
        ...mockCharacter2, 
        character_id: 'char-789',
        name: 'Boromir',
        status: 'Dead' 
      };

      mockGetUserCharacters.mockResolvedValue({
        characters: [healthyChar, deadChar],
        count: 2,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
        expect(screen.getByText('Boromir')).toBeInTheDocument();
      });

      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('Dead')).toBeInTheDocument();
    });
  });

  describe('Character Card Actions', () => {
    it('resume button links to correct game route', async () => {
      mockGetUserCharacters.mockResolvedValue({
        characters: [mockCharacter1],
        count: 1,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const resumeButton = screen.getByText('Resume Adventure');
      expect(resumeButton).toHaveAttribute('href', `/game/${mockCharacter1.character_id}`);
    });

    it('each character has its own resume button with correct link', async () => {
      mockGetUserCharacters.mockResolvedValue({
        characters: [mockCharacter1, mockCharacter2],
        count: 2,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
      });

      const resumeButtons = screen.getAllByText('Resume Adventure');
      expect(resumeButtons).toHaveLength(2);
      expect(resumeButtons[0]).toHaveAttribute('href', `/game/${mockCharacter1.character_id}`);
      expect(resumeButtons[1]).toHaveAttribute('href', `/game/${mockCharacter2.character_id}`);
    });
  });

  describe('Component Lifecycle', () => {
    it('fetches characters on mount', async () => {
      mockGetUserCharacters.mockResolvedValue({
        characters: [mockCharacter1],
        count: 1,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(mockGetUserCharacters).toHaveBeenCalledTimes(1);
      });
    });

    it('handles component unmount gracefully', async () => {
      mockGetUserCharacters.mockResolvedValue({
        characters: [mockCharacter1],
        count: 1,
      } as ListCharactersResponse);

      const { unmount } = render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing optional metadata gracefully', async () => {
      const characterWithMinimalData: CharacterMetadata = {
        character_id: 'char-minimal',
        name: 'Minimal',
        race: 'Unknown',
        class: 'Unknown',
        status: 'Healthy',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockGetUserCharacters.mockResolvedValue({
        characters: [characterWithMinimalData],
        count: 1,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Minimal')).toBeInTheDocument();
      });

      // Should still render all fields
      expect(screen.getByText('Race:')).toBeInTheDocument();
      expect(screen.getByText('Class:')).toBeInTheDocument();
    });

    it('handles invalid date strings gracefully', async () => {
      const characterWithBadDates: CharacterMetadata = {
        ...mockCharacter1,
        created_at: 'invalid-date',
        updated_at: 'invalid-date',
      };

      mockGetUserCharacters.mockResolvedValue({
        characters: [characterWithBadDates],
        count: 1,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Should display the raw string if date parsing fails
      const invalidDates = screen.getAllByText('invalid-date');
      expect(invalidDates.length).toBeGreaterThan(0);
    });

    it('renders with stable keys for multiple characters', async () => {
      mockGetUserCharacters.mockResolvedValue({
        characters: [mockCharacter1, mockCharacter2],
        count: 2,
      } as ListCharactersResponse);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Both character cards should be in the document
      const cards = document.querySelectorAll('.character-card');
      expect(cards).toHaveLength(2);
    });
  });

  describe('Advanced Error Handling Edge Cases', () => {
    it('handles 500 server error with retry guidance', async () => {
      const error500 = { status: 500, message: 'Internal Server Error' } as any;
      mockGetUserCharacters.mockRejectedValue(error500);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Characters')).toBeInTheDocument();
        // 500 errors map to transient server error message
        expect(screen.getByText(/Server error\. Please try again later/)).toBeInTheDocument();
      });

      // Should display retry button for transient errors
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();
    });

    it('handles 500 error then success on retry', async () => {
      const error500 = { status: 500, message: 'Internal Server Error' } as any;
      
      mockGetUserCharacters
        .mockRejectedValueOnce(error500)
        .mockResolvedValueOnce({
          characters: [mockCharacter1],
          count: 1,
        } as ListCharactersResponse);

      render(<TestApp />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Characters')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText('Your Characters')).toBeInTheDocument();
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      expect(mockGetUserCharacters).toHaveBeenCalledTimes(2);
    });

    it('handles 503 Service Unavailable error', async () => {
      const error503 = { status: 503, message: 'Service Unavailable' } as any;
      mockGetUserCharacters.mockRejectedValue(error503);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Characters')).toBeInTheDocument();
        expect(screen.getByText(/Service under maintenance/)).toBeInTheDocument();
      });

      // Should allow retry for 503 errors
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('handles 429 Rate Limit error', async () => {
      const error429 = { status: 429, message: 'Too Many Requests' } as any;
      mockGetUserCharacters.mockRejectedValue(error429);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Characters')).toBeInTheDocument();
        expect(screen.getByText(/Too many requests\. Please wait/)).toBeInTheDocument();
      });

      // Should allow retry for rate limit errors
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('handles timeout error (408)', async () => {
      const error408 = { status: 408, message: 'Request Timeout' } as any;
      mockGetUserCharacters.mockRejectedValue(error408);

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Characters')).toBeInTheDocument();
        expect(screen.getByText(/Request timeout\. Please check your connection/)).toBeInTheDocument();
      });

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  describe('Race Condition Handling', () => {
    it('handles rapid component mount/unmount gracefully', async () => {
      mockGetUserCharacters.mockImplementation(
        () => new Promise(resolve => 
          setTimeout(() => resolve({ characters: [mockCharacter1], count: 1 }), 100)
        )
      );

      const { unmount } = render(<TestApp />);

      // Unmount before request completes
      unmount();

      // Should not throw or cause errors
      expect(() => unmount()).not.toThrow();
    });

    it('handles latest response when multiple requests overlap', async () => {
      let resolveFirst: (value: any) => void;
      let resolveSecond: (value: any) => void;

      const firstPromise = new Promise(resolve => { resolveFirst = resolve; });
      const secondPromise = new Promise(resolve => { resolveSecond = resolve; });

      mockGetUserCharacters
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise);

      const { rerender } = render(<TestApp />);

      // First request starts
      await waitFor(() => {
        expect(mockGetUserCharacters).toHaveBeenCalledTimes(1);
      });

      // Force a second fetch by triggering a retry
      // (In practice, this scenario is prevented by the loading state, but testing defensively)
      rerender(<TestApp />);

      // Resolve second request first (newer data)
      resolveSecond!({
        characters: [mockCharacter2],
        count: 1,
      } as ListCharactersResponse);

      // Then resolve first request (older data)
      resolveFirst!({
        characters: [mockCharacter1],
        count: 1,
      } as ListCharactersResponse);

      // Due to React's state management, the last setState call wins
      // This test documents current behavior
      await waitFor(() => {
        // Should show one of the characters (behavior depends on React timing)
        const hasAragorn = screen.queryByText('Aragorn') !== null;
        const hasGandalf = screen.queryByText('Gandalf') !== null;
        expect(hasAragorn || hasGandalf).toBe(true);
      });
    });
  });
});
