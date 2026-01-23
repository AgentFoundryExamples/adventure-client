import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserCharacters } from '@/api/journeyLog';
import type { CharacterMetadata } from '@/api/journeyLog';
import { ErrorNotice } from '@/components';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface LocationState {
  message?: string;
  severity?: 'error' | 'warning' | 'info';
}

export default function CharactersDashboardPage() {
  const [characters, setCharacters] = useState<CharacterMetadata[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [flashMessage, setFlashMessage] = useState<{ message: string; severity: 'error' | 'warning' | 'info' } | null>(null);

  // Handle flash messages from navigation state
  useEffect(() => {
    const state = location.state as LocationState | undefined;
    if (state?.message) {
      // Intentionally setting state in effect: this is a synchronous initialization from
      // navigation state on mount, not a cascading render
      /* eslint-disable react-hooks/set-state-in-effect */
      setFlashMessage({
        message: state.message,
        severity: state.severity || 'info'
      });
      /* eslint-enable react-hooks/set-state-in-effect */
      // Clear the location state to prevent re-showing on refresh
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const fetchCharacters = useCallback(async () => {
    setLoadingState('loading');
    setError(null);

    try {
      const response = await getUserCharacters();
      setCharacters(response.characters);
      setLoadingState('success');
    } catch (err) {
      console.error('Failed to fetch characters:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load characters'
      );
      setLoadingState('error');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCharacters();
  }, [fetchCharacters]);

  if (loadingState === 'loading') {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading your characters...</p>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="error-state">
        <h2>Unable to Load Characters</h2>
        <p className="error-message">{error}</p>
        <button onClick={fetchCharacters} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="empty-state">
        <h1>Welcome to Your Adventure</h1>
        <p>You don't have any characters yet.</p>
        <p>Create your first character to begin your journey!</p>
        <Link to="/app/new-character" className="cta-button">
          Create Your First Character
        </Link>
      </div>
    );
  }

  return (
    <div className="characters-dashboard">
      {flashMessage && (
        <ErrorNotice
          title={flashMessage.severity === 'error' ? 'Error' : flashMessage.severity === 'warning' ? 'Warning' : 'Notice'}
          message={flashMessage.message}
          severity={flashMessage.severity}
          variant="toast"
          autoDismissMs={5000}
          onDismiss={() => setFlashMessage(null)}
        />
      )}
      <header className="dashboard-header">
        <h1>Your Characters</h1>
        <p>{characters.length} character{characters.length !== 1 ? 's' : ''}</p>
      </header>

      <div className="dashboard-actions">
        <Link to="/app/new-character" className="button button-primary">
          New Character
        </Link>
      </div>

      <div className="characters-grid">
        {characters.map((character) => (
          <CharacterCard key={character.character_id} character={character} />
        ))}
      </div>
    </div>
  );
}

interface CharacterCardProps {
  character: CharacterMetadata;
}

/**
 * Character card component displaying metadata for a single character.
 * 
 * Prefetching Strategy:
 * - The last turn data is NOT prefetched here to keep the dashboard lightweight
 * - Last turn fetching is deferred to the GamePage component when the user clicks Resume
 * - This avoids making N additional API calls for N characters on dashboard load
 */
function CharacterCard({ character }: CharacterCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <article className="character-card">
      <div className="character-card-header">
        <h3 className="character-name">{character.name}</h3>
        <span className={`character-status status-${character.status}`}>
          {character.status}
        </span>
      </div>

      <div className="character-details">
        <div className="character-detail">
          <span className="detail-label">Race:</span>
          <span className="detail-value">{character.race}</span>
        </div>
        <div className="character-detail">
          <span className="detail-label">Class:</span>
          <span className="detail-value">{character.class}</span>
        </div>
      </div>

      <div className="character-timestamps">
        <div className="timestamp">
          <span className="timestamp-label">Created:</span>
          <span className="timestamp-value">{formatDate(character.created_at)}</span>
        </div>
        <div className="timestamp">
          <span className="timestamp-label">Updated:</span>
          <span className="timestamp-value">{formatDate(character.updated_at)}</span>
        </div>
      </div>

      <div className="character-actions">
        <Link
          to={`/game/${character.character_id}`}
          className="resume-button"
        >
          Resume Adventure
        </Link>
      </div>
    </article>
  );
}
