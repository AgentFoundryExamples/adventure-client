import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { submitTurn, CharactersService } from '@/api';
import type { GetNarrativeResponse, NarrativeTurn, TurnResponse } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { ErrorNotice, LoadingSpinner } from '@/components';
import { getFriendlyErrorMessage } from '@/lib/http/errors';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface LocationState {
  initialScenario?: {
    narrative: string;
    character_id: string;
  };
}

interface Turn {
  player_action: string;
  gm_response: string;
  timestamp?: string;
}

// Maximum number of turns to keep in history to prevent unbounded growth
const MAX_HISTORY_SIZE = 20;

export default function GamePage() {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const logContainerRef = useRef<HTMLDivElement>(null);
  const { uid } = useAuth();
  
  // Memoize the initial scenario to prevent unnecessary re-renders
  const initialScenario = useMemo(() => {
    const state = location.state as LocationState | undefined;
    return state?.initialScenario;
  }, [location.state]);
  
  const [lastTurn, setLastTurn] = useState<NarrativeTurn | null>(null);
  const [turnHistory, setTurnHistory] = useState<Turn[]>([]);
  const [currentScenario, setCurrentScenario] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Action submission states
  const [playerAction, setPlayerAction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [persistWarning, setPersistWarning] = useState<string | null>(null);

  useEffect(() => {
    // Validate characterId before making request
    if (!characterId || characterId.trim() === '') {
      console.error('GamePage: No characterId provided');
      navigate('/app');
      return;
    }

    // If we have an initial scenario from character creation, use it instead of fetching
    if (initialScenario && initialScenario.character_id === characterId) {
      // Create a synthetic NarrativeTurn from the initial scenario
      const initialTurn: NarrativeTurn = {
        turn_id: `initial-${characterId}`,
        turn_number: 1,
        gm_response: initialScenario.narrative,
        player_action: '',
        timestamp: new Date().toISOString(),
      };
      // Intentionally setting state in effect: this is a synchronous initialization from
      // navigation state on mount, not a cascading render. The early return prevents
      // any further state updates. This is the recommended pattern for handling router state.
       
      setLastTurn(initialTurn);
      setCurrentScenario(initialScenario.narrative);
      setTurnHistory([]);
      setLoadingState('success');
       

      // Clear the location state to prevent re-processing on re-renders or back navigation
      navigate(location.pathname, { replace: true, state: null });

      return;
    }

    setLoadingState('loading');
    setError(null);

    const fetchLastTurn = async () => {
      try {
        // Fetch last 10 turns to populate history
        const response: GetNarrativeResponse = await CharactersService.getNarrativeTurnsCharactersCharacterIdNarrativeGet({
          characterId,
          n: 10,
          xUserId: uid || null,
        });
        
        if (response.turns && response.turns.length > 0) {
          // Get the most recent turn as the current scenario
          const latestTurn = response.turns[response.turns.length - 1];
          setLastTurn(latestTurn);
          setCurrentScenario(latestTurn.gm_response);
          
          // Build turn history from all fetched turns (excluding initial/empty turns)
          const history: Turn[] = response.turns
            .filter(turn => turn.player_action) // Only include turns with player actions
            .map(turn => ({
              player_action: turn.player_action,
              gm_response: turn.gm_response,
              timestamp: turn.timestamp
            }));
          
          setTurnHistory(history);
          setLoadingState('success');
        } else {
          setLastTurn(null);
          setCurrentScenario('');
          setTurnHistory([]);
          setLoadingState('success');
        }
      } catch (err) {
        console.error('Failed to fetch last turn:', err);
        
        // Use centralized error handling
        const { message } = getFriendlyErrorMessage(err, 'Failed to load game state');
        
        // Handle specific error codes - check for status property
        if (err && typeof err === 'object' && 'status' in err) {
          const status = (err as { status: number }).status;
          if (status === 404) {
            setError('Failed to load game state: Character not found. It may have been deleted.');
            setLoadingState('error');
          } else if (status === 403) {
            // Access denied - redirect to /app with error message
            console.warn('Access denied to character, redirecting to /app');
            navigate('/app', {
              replace: true,
              state: {
                message: 'Access denied. You do not have permission to view this character.',
                severity: 'error'
              }
            });
          } else {
            setError(message);
            setLoadingState('error');
          }
        } else {
          setError(message);
          setLoadingState('error');
        }
      }
    };

    fetchLastTurn();
  }, [characterId, navigate, retryCount, initialScenario, location.pathname, uid]);
  
  // Auto-scroll to newest entry when updated
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [turnHistory, currentScenario]);

  const handleSubmitAction = async () => {
    if (!characterId || !playerAction.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setPersistWarning(null);

    try {
      // Step 1: Call dungeon-master API to generate narrative
      const response: TurnResponse = await submitTurn({
        character_id: characterId,
        user_action: playerAction.trim(),
      });

      // Step 2: Persist turn to journey-log
      // This is a separate API call as documented - dungeon-master does NOT auto-persist
      let persistedTimestamp: string | undefined;
      try {
        if (!uid) {
          throw new Error('User ID not available');
        }
        
        const persistResponse = await CharactersService.appendNarrativeTurnCharactersCharacterIdNarrativePost({
          characterId,
          xUserId: uid,
          requestBody: {
            user_action: playerAction.trim(),
            ai_response: response.narrative,
            // Let server generate timestamp for consistency
          }
        });
        
        // Use the server-provided timestamp from the persisted turn
        persistedTimestamp = persistResponse.turn.timestamp;
      } catch (persistErr) {
        console.error('Failed to persist turn to journey-log:', persistErr);
        
        // Use centralized error handling for persist warnings
        const { message } = getFriendlyErrorMessage(persistErr, 'Failed to save turn');
        setPersistWarning(message);
      }

      // Step 3: Update the UI with the new turn
      const newTurn: Turn = {
        player_action: playerAction.trim(),
        gm_response: response.narrative,
        timestamp: persistedTimestamp || new Date().toISOString(),
      };

      // Cap history at MAX_HISTORY_SIZE to prevent unbounded growth
      setTurnHistory(prev => {
        const updated = [...prev, newTurn];
        return updated.length > MAX_HISTORY_SIZE 
          ? updated.slice(updated.length - MAX_HISTORY_SIZE)
          : updated;
      });
      setCurrentScenario(response.narrative);
      setPlayerAction('');
      
    } catch (err) {
      console.error('Failed to submit action:', err);
      
      // Use centralized error handling
      const { message } = getFriendlyErrorMessage(err, 'Failed to submit action');
      
      // Handle specific error codes with redirects or specific messages - check for status property
      if (err && typeof err === 'object' && 'status' in err) {
        const status = (err as { status: number }).status;
        
        if (status === 403) {
          // Access denied - redirect to /app with error message
          console.warn('Access denied when submitting turn, redirecting to /app');
          navigate('/app', {
            replace: true,
            state: {
              message: 'Access denied. You do not have permission to interact with this character.',
              severity: 'error'
            }
          });
          return;
        } else if (status === 404) {
          setSubmitError('Failed to submit action: Character not found. It may have been deleted.');
        } else {
          setSubmitError(message);
        }
      } else {
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isSubmitting && playerAction.trim()) {
        handleSubmitAction();
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loadingState === 'loading' || loadingState === 'idle') {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" label="Loading game state..." />
      </div>
    );
  }

  if (loadingState === 'error') {
    const isAuthError = error && typeof error === 'string' && error.includes('Authentication failed');
    
    return (
      <div className="error-state">
        <ErrorNotice
          title="Unable to Load Game"
          message={error || 'An unexpected error occurred'}
          severity="error"
          variant="inline"
          onRetry={isAuthError ? undefined : handleRetry}
        />
        {isAuthError && (
          <button onClick={() => navigate('/login')} className="cta-button">
            Go to Login
          </button>
        )}
      </div>
    );
  }

  // Empty state - no turns recorded
  if (loadingState === 'success' && !lastTurn && !currentScenario) {
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

  // Success state with turn data - render gameplay UI
  if (loadingState === 'success' && (lastTurn || currentScenario)) {
    return (
      <div className="game-page">
        <header className="game-header">
          <h1>Adventure in Progress</h1>
          <button onClick={() => navigate('/app')} className="back-button" aria-label="Back to characters list">
            Back to Characters
          </button>
        </header>

        {/* Current Scenario */}
        <section className="current-scenario-section" aria-labelledby="current-scene-heading">
          <h2 id="current-scene-heading">Current Scene</h2>
          <div className="scenario-content" role="region" aria-live="polite">
            <p className="scenario-text">{currentScenario}</p>
          </div>
        </section>

        {/* Turn History Log */}
        {turnHistory.length > 0 && (
          <section className="turn-history-section" aria-labelledby="recent-actions-heading">
            <h2 id="recent-actions-heading">Recent Actions</h2>
            <div className="turn-history-log" ref={logContainerRef} role="log" aria-live="polite" aria-atomic="false">
              {turnHistory.map((turn, index) => (
                <div key={index} className="history-turn-entry">
                  <div className="history-player-action">
                    <span className="action-label">You:</span>
                    <p className="action-text">{turn.player_action}</p>
                  </div>
                  <div className="history-dm-response">
                    <span className="response-label">DM:</span>
                    <p className="response-text">{turn.gm_response}</p>
                  </div>
                  {turn.timestamp && (
                    <div className="history-timestamp">
                      <time dateTime={turn.timestamp}>{formatTimestamp(turn.timestamp)}</time>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action Input Form */}
        <section className="action-input-section" aria-labelledby="action-input-heading">
          <h2 id="action-input-heading">What do you do?</h2>
          
          {submitError && (
            <ErrorNotice
              title="Action Failed"
              message={submitError}
              severity="error"
              variant="inline"
              onDismiss={() => setSubmitError(null)}
            />
          )}
          
          {persistWarning && (
            <ErrorNotice
              title="Save Warning"
              message={persistWarning}
              severity="warning"
              variant="inline"
              onDismiss={() => setPersistWarning(null)}
            />
          )}

          <form className="action-input-form" onSubmit={(e) => { e.preventDefault(); handleSubmitAction(); }}>
            <label htmlFor="player-action" className="sr-only">
              Describe your action
            </label>
            <textarea
              id="player-action"
              className="action-textarea"
              value={playerAction}
              onChange={(e) => setPlayerAction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your action... (Press Ctrl+Enter to submit)"
              disabled={isSubmitting}
              rows={4}
              aria-describedby="action-hint"
            />
            <div className="form-actions">
              <button
                type="submit"
                className="act-button"
                disabled={isSubmitting || !playerAction.trim()}
                aria-label={isSubmitting ? 'Processing action' : 'Submit action'}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Act'
                )}
              </button>
            </div>
            <p id="action-hint" className="action-hint">
              Tip: Press <kbd>Ctrl+Enter</kbd> to submit your action
            </p>
          </form>
        </section>
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
