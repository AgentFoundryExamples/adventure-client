import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCharacterLastTurn } from '@/api';
import type { GetNarrativeResponse, NarrativeTurn } from '@/api';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface LocationState {
  initialScenario?: {
    narrative: string;
    character_id: string;
  };
}

export default function GamePage() {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | undefined;
  const [lastTurn, setLastTurn] = useState<NarrativeTurn | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Validate characterId before making request
    if (!characterId || characterId.trim() === '') {
      console.error('GamePage: No characterId provided');
      navigate('/app');
      return;
    }

    // If we have an initial scenario from character creation, use it instead of fetching
    if (locationState?.initialScenario && locationState.initialScenario.character_id === characterId) {
      // Create a synthetic NarrativeTurn from the initial scenario
      const initialTurn: NarrativeTurn = {
        turn_id: `initial-${characterId}`,
        turn_number: 1,
        gm_response: locationState.initialScenario.narrative,
        player_action: '',
        timestamp: new Date().toISOString(),
      };
      setLastTurn(initialTurn);
      setLoadingState('success');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingState('loading');
    setError(null);

    const fetchLastTurn = async () => {
      try {
        const response: GetNarrativeResponse = await getCharacterLastTurn(characterId);
        
        if (response.turns && response.turns.length > 0) {
          setLastTurn(response.turns[0]);
          setLoadingState('success');
        } else {
          setLastTurn(null);
          setLoadingState('success');
        }
      } catch (err) {
        console.error('Failed to fetch last turn:', err);
        
        // Handle specific error codes - safer error status property access
        const status = err && typeof err === 'object' && 'status' in err 
          ? (err as { status: number }).status 
          : undefined;
        if (status === 404) {
          setError('Character not found');
        } else if (status === 401 || status === 403) {
          setError('Unauthorized. Please log in again.');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load last turn');
        }
        setLoadingState('error');
      }
    };

    fetchLastTurn();
  }, [characterId, navigate, retryCount, locationState]);

  if (loadingState === 'loading' || loadingState === 'idle') {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading last turn...</p>
      </div>
    );
  }

  if (loadingState === 'error') {
    const handleRetry = () => {
      setRetryCount(prev => prev + 1);
    };

    return (
      <div className="error-state">
        <h2>Unable to Load Last Turn</h2>
        <p className="error-message">{error}</p>
        {error?.includes('Unauthorized') ? (
          <button onClick={() => navigate('/login')} className="retry-button">
            Go to Login
          </button>
        ) : (
          <button onClick={handleRetry} className="retry-button">
            Retry
          </button>
        )}
      </div>
    );
  }

  // Empty state - no turns recorded
  if (loadingState === 'success' && !lastTurn) {
    return (
      <div className="empty-state">
        <h1>No Turns Yet</h1>
        <p>This character doesn't have any recorded turns yet.</p>
        <p>Gameplay will resume once a new turn exists.</p>
        <button onClick={() => navigate('/app')} className="cta-button">
          Back to Characters
        </button>
      </div>
    );
  }

  // Success state with turn data - lastTurn is guaranteed to be non-null here
  if (loadingState === 'success' && lastTurn) {
    return (
      <div className="game-page">
        <header className="game-header">
          <h1>Last Turn</h1>
          <button onClick={() => navigate('/app')} className="back-button">
            Back to Characters
          </button>
        </header>

        <div className="turn-container">
          {/* Dungeon Master Response Section */}
          <section className="turn-section dm-section">
            <h2>Last Dungeon Master Response</h2>
            <div className="turn-content">
              <p className="turn-text">{lastTurn.gm_response}</p>
            </div>
            {lastTurn.timestamp && (
              <div className="turn-metadata">
                <span className="timestamp-label">Time:</span>
                <span className="timestamp-value">{formatTimestamp(lastTurn.timestamp)}</span>
              </div>
            )}
          </section>

          {/* Player Action Section */}
          <section className="turn-section player-section">
            <h2>Your Last Action</h2>
            <div className="turn-content">
              {lastTurn.player_action ? (
                <p className="turn-text">{lastTurn.player_action}</p>
              ) : (
                <p className="turn-text placeholder">No player action recorded for this turn.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Fallback - should never reach here
  return null;
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return timestamp;
    }
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}
