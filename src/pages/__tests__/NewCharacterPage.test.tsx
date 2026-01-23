import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NewCharacterPage from '../NewCharacterPage';
import { useAuth } from '@/hooks/useAuth';
import type { CharacterCreationResponse } from '@/api';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

// Mock the firebase lib
vi.mock('@/lib/firebase', () => ({
  getFirebaseAuth: vi.fn(() => ({})),
  getFirebaseApp: vi.fn(() => ({})),
}));

// Mock config module
vi.mock('@/config/env', () => ({
  config: {
    dungeonMasterApiUrl: 'https://dungeon-master.example.com',
    journeyLogApiUrl: 'https://journey-log.example.com',
    firebaseConfig: {
      apiKey: 'test-api-key',
      authDomain: 'test-auth-domain.firebaseapp.com',
      projectId: 'test-project-id',
    },
    isDevelopment: true,
  },
}));

// Mock the hooks and API
vi.mock('@/hooks/useAuth');
vi.mock('@/api', () => ({
  createCharacter: vi.fn(),
}));

// Mock navigation
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
      <NewCharacterPage />
    </BrowserRouter>
  );
}

describe('NewCharacterPage', () => {
  const mockGetIdToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      getIdToken: mockGetIdToken,
      user: { uid: 'test-user-123' },
      isAuthenticated: true,
    });

    mockGetIdToken.mockResolvedValue('mock-firebase-token');
  });

  describe('Page Structure', () => {
    it('renders the page with form fields', () => {
      render(<TestApp />);

      expect(screen.getByText('Create New Character')).toBeInTheDocument();
      expect(screen.getByLabelText(/character name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/race/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/adventure prompt/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create adventure/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('displays required field indicators', () => {
      render(<TestApp />);

      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers).toHaveLength(3); // Name, Race, Class
    });

    it('displays field hints', () => {
      render(<TestApp />);

      expect(screen.getByText('1-100 characters')).toBeInTheDocument();
      expect(screen.getAllByText('1-50 characters')).toHaveLength(2); // Race and Class
      expect(screen.getByText(/max 2000 characters/i)).toBeInTheDocument();
    });

    it('displays optional label for adventure prompt', () => {
      render(<TestApp />);

      expect(screen.getByText('(Optional)')).toBeInTheDocument();
    });
  });

  describe('Client-side Validation', () => {
    it('shows error when name is empty', async () => {
      render(<TestApp />);

      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      expect(mockGetIdToken).not.toHaveBeenCalled();
    });

    it('shows error when race is empty', async () => {
      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      fireEvent.change(nameInput, { target: { value: 'Test Hero' } });

      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Race is required')).toBeInTheDocument();
      });

      expect(mockGetIdToken).not.toHaveBeenCalled();
    });

    it('shows error when class is empty', async () => {
      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      
      fireEvent.change(nameInput, { target: { value: 'Test Hero' } });
      fireEvent.change(raceInput, { target: { value: 'Human' } });

      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Class is required')).toBeInTheDocument();
      });

      expect(mockGetIdToken).not.toHaveBeenCalled();
    });

    it('shows error when name exceeds 100 characters', async () => {
      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      fireEvent.change(nameInput, { target: { value: 'a'.repeat(101) } });

      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name must be 100 characters or less')).toBeInTheDocument();
      });
    });

    it('shows error when race exceeds 50 characters', async () => {
      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      
      fireEvent.change(nameInput, { target: { value: 'Hero' } });
      fireEvent.change(raceInput, { target: { value: 'a'.repeat(51) } });

      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Race must be 50 characters or less')).toBeInTheDocument();
      });
    });

    it('shows error when class exceeds 50 characters', async () => {
      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      
      fireEvent.change(nameInput, { target: { value: 'Hero' } });
      fireEvent.change(raceInput, { target: { value: 'Human' } });
      fireEvent.change(classInput, { target: { value: 'a'.repeat(51) } });

      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Class must be 50 characters or less')).toBeInTheDocument();
      });
    });

    it('shows error when adventure prompt exceeds 2000 characters', async () => {
      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const promptInput = screen.getByLabelText(/adventure prompt/i);
      
      fireEvent.change(nameInput, { target: { value: 'Hero' } });
      fireEvent.change(raceInput, { target: { value: 'Human' } });
      fireEvent.change(classInput, { target: { value: 'Warrior' } });
      fireEvent.change(promptInput, { target: { value: 'a'.repeat(2001) } });

      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Adventure prompt must be 2000 characters or less')).toBeInTheDocument();
      });
    });

    it('clears field error when user types', async () => {
      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      fireEvent.change(nameInput, { target: { value: 'Hero' } });

      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits valid form data successfully', async () => {
      const { createCharacter } = await import('@/api');
      const mockResponse: CharacterCreationResponse = {
        character_id: 'char-123',
        narrative: 'You awaken in a tavern...',
      };
      
      (createCharacter as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.change(nameInput, { target: { value: 'Thorin' } });
      fireEvent.change(raceInput, { target: { value: 'Dwarf' } });
      fireEvent.change(classInput, { target: { value: 'Warrior' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockGetIdToken).toHaveBeenCalled();
        expect(createCharacter).toHaveBeenCalledWith({
          name: 'Thorin',
          race: 'Dwarf',
          class_name: 'Warrior',
          custom_prompt: null,
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/game/char-123', {
          state: {
            initialScenario: {
              narrative: 'You awaken in a tavern...',
              character_id: 'char-123',
            },
          },
        });
      });
    });

    it('submits form with custom prompt', async () => {
      const { createCharacter } = await import('@/api');
      const mockResponse: CharacterCreationResponse = {
        character_id: 'char-456',
        narrative: 'In the perpetual twilight...',
      };
      
      (createCharacter as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const promptInput = screen.getByLabelText(/adventure prompt/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.change(nameInput, { target: { value: 'Aelthor' } });
      fireEvent.change(raceInput, { target: { value: 'Elf' } });
      fireEvent.change(classInput, { target: { value: 'Wizard' } });
      fireEvent.change(promptInput, { target: { value: 'A dark fantasy world' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createCharacter).toHaveBeenCalledWith({
          name: 'Aelthor',
          race: 'Elf',
          class_name: 'Wizard',
          custom_prompt: 'A dark fantasy world',
        });
      });
    });

    it('disables form during submission', async () => {
      const { createCharacter } = await import('@/api');
      
      (createCharacter as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.change(nameInput, { target: { value: 'Hero' } });
      fireEvent.change(raceInput, { target: { value: 'Human' } });
      fireEvent.change(classInput, { target: { value: 'Fighter' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });

      expect(nameInput).toBeDisabled();
      expect(raceInput).toBeDisabled();
      expect(classInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('shows error when token retrieval fails', async () => {
      mockGetIdToken.mockResolvedValue(null);

      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.change(nameInput, { target: { value: 'Hero' } });
      fireEvent.change(raceInput, { target: { value: 'Human' } });
      fireEvent.change(classInput, { target: { value: 'Warrior' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
      });
    });

    it('handles 401 authentication errors', async () => {
      const { createCharacter } = await import('@/api');
      
      (createCharacter as ReturnType<typeof vi.fn>).mockRejectedValue({
        status: 401,
        body: { detail: 'Invalid token' },
      });

      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.change(nameInput, { target: { value: 'Hero' } });
      fireEvent.change(raceInput, { target: { value: 'Human' } });
      fireEvent.change(classInput, { target: { value: 'Warrior' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
      });
    });

    it('handles 422 validation errors with field mapping', async () => {
      const { createCharacter } = await import('@/api');
      
      (createCharacter as ReturnType<typeof vi.fn>).mockRejectedValue({
        status: 422,
        body: {
          detail: [
            { loc: ['body', 'name'], msg: 'Name too short' },
            { loc: ['body', 'race'], msg: 'Invalid race' },
          ],
        },
      });

      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.change(nameInput, { target: { value: 'H' } });
      fireEvent.change(raceInput, { target: { value: 'X' } });
      fireEvent.change(classInput, { target: { value: 'Warrior' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name too short')).toBeInTheDocument();
        expect(screen.getByText('Invalid race')).toBeInTheDocument();
      });
    });

    it('handles 422 validation errors with string detail', async () => {
      const { createCharacter } = await import('@/api');
      
      (createCharacter as ReturnType<typeof vi.fn>).mockRejectedValue({
        status: 422,
        body: {
          detail: 'General validation error',
        },
      });

      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.change(nameInput, { target: { value: 'Hero' } });
      fireEvent.change(raceInput, { target: { value: 'Human' } });
      fireEvent.change(classInput, { target: { value: 'Warrior' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('General validation error')).toBeInTheDocument();
      });
    });

    it('handles 429 rate limit errors', async () => {
      const { createCharacter } = await import('@/api');
      
      (createCharacter as ReturnType<typeof vi.fn>).mockRejectedValue({
        status: 429,
        body: { detail: 'Too many requests' },
      });

      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.change(nameInput, { target: { value: 'Hero' } });
      fireEvent.change(raceInput, { target: { value: 'Human' } });
      fireEvent.change(classInput, { target: { value: 'Warrior' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      });
    });

    it('handles 500 server errors', async () => {
      const { createCharacter } = await import('@/api');
      
      (createCharacter as ReturnType<typeof vi.fn>).mockRejectedValue({
        status: 500,
        body: { detail: 'Internal server error' },
      });

      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.change(nameInput, { target: { value: 'Hero' } });
      fireEvent.change(raceInput, { target: { value: 'Human' } });
      fireEvent.change(classInput, { target: { value: 'Warrior' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/server error.*contact support/i)).toBeInTheDocument();
      });
    });

    it('handles generic Error objects', async () => {
      const { createCharacter } = await import('@/api');
      
      (createCharacter as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      );

      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.change(nameInput, { target: { value: 'Hero' } });
      fireEvent.change(raceInput, { target: { value: 'Human' } });
      fireEvent.change(classInput, { target: { value: 'Warrior' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('handles unknown error types', async () => {
      const { createCharacter } = await import('@/api');
      
      (createCharacter as ReturnType<typeof vi.fn>).mockRejectedValue('Unknown error');

      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      
      fireEvent.change(nameInput, { target: { value: 'Hero' } });
      fireEvent.change(raceInput, { target: { value: 'Human' } });
      fireEvent.change(classInput, { target: { value: 'Warrior' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Button', () => {
    it('navigates back to dashboard when cancel is clicked', () => {
      render(<TestApp />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<TestApp />);

      const nameInput = screen.getByLabelText(/character name/i);
      const raceInput = screen.getByLabelText(/race/i);
      const classInput = screen.getByLabelText(/class/i);
      const promptInput = screen.getByLabelText(/adventure prompt/i);

      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
      expect(raceInput).toHaveAttribute('aria-invalid', 'false');
      expect(classInput).toHaveAttribute('aria-invalid', 'false');
      expect(promptInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('sets aria-invalid and aria-describedby on error', async () => {
      render(<TestApp />);

      const submitButton = screen.getByRole('button', { name: /create adventure/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/character name/i);
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
        expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      });
    });
  });
});
