import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GameService, DefaultService } from '@/api';

interface ApiCallResult {
  service: string;
  endpoint: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  statusCode?: number;
  data?: unknown;
  error?: string;
  headers?: Record<string, string>;
  timestamp?: Date;
}

export default function DebugPage() {
  const { user, uid, getIdToken } = useAuth();
  const [verboseLogging, setVerboseLogging] = useState(false);
  const [results, setResults] = useState<ApiCallResult[]>([]);

  const maskToken = (token: string): string => {
    if (token.length <= 8) return '***';
    return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
  };

  const logResult = (result: ApiCallResult) => {
    setResults((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10 results
    
    if (verboseLogging) {
      console.group(`[Debug] ${result.service} - ${result.endpoint}`);
      console.log('Status:', result.status);
      console.log('Status Code:', result.statusCode);
      console.log('Timestamp:', result.timestamp);
      if (result.headers) {
        console.log('Headers:', result.headers);
      }
      if (result.data) {
        console.log('Response Data:', result.data);
      }
      if (result.error) {
        console.error('Error:', result.error);
      }
      console.groupEnd();
    }
  };

  const callDungeonMasterHealth = async () => {
    const result: ApiCallResult = {
      service: 'Dungeon Master',
      endpoint: '/health',
      status: 'loading',
      timestamp: new Date(),
    };
    logResult(result);

    try {
      const token = await getIdToken();
      const displayHeaders: Record<string, string> = {};
      if (token) {
        displayHeaders['Authorization'] = `Bearer ${maskToken(token)}`;
      }

      const response = await GameService.healthCheckHealthGet();
      
      const successResult: ApiCallResult = {
        ...result,
        status: 'success',
        statusCode: 200,
        data: response,
        headers: displayHeaders,
      };
      logResult(successResult);
    } catch (error) {
      const errorResult: ApiCallResult = {
        ...result,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      logResult(errorResult);
    }
  };

  const callJourneyLogHealth = async () => {
    const result: ApiCallResult = {
      service: 'Journey Log',
      endpoint: '/health',
      status: 'loading',
      timestamp: new Date(),
    };
    logResult(result);

    try {
      const token = await getIdToken();
      const displayHeaders: Record<string, string> = {};
      if (token) {
        displayHeaders['Authorization'] = `Bearer ${maskToken(token)}`;
      }
      if (uid) {
        displayHeaders['X-User-Id'] = uid;
      }

      const response = await DefaultService.healthHealthGet();
      
      const successResult: ApiCallResult = {
        ...result,
        status: 'success',
        statusCode: 200,
        data: response,
        headers: displayHeaders,
      };
      logResult(successResult);
    } catch (error) {
      const errorResult: ApiCallResult = {
        ...result,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      logResult(errorResult);
    }
  };

  const callJourneyLogInfo = async () => {
    const result: ApiCallResult = {
      service: 'Journey Log',
      endpoint: '/info',
      status: 'loading',
      timestamp: new Date(),
    };
    logResult(result);

    try {
      const token = await getIdToken();
      const displayHeaders: Record<string, string> = {};
      if (token) {
        displayHeaders['Authorization'] = `Bearer ${maskToken(token)}`;
      }
      if (uid) {
        displayHeaders['X-User-Id'] = uid;
      }

      const response = await DefaultService.infoInfoGet();
      
      const successResult: ApiCallResult = {
        ...result,
        status: 'success',
        statusCode: 200,
        data: response,
        headers: displayHeaders,
      };
      logResult(successResult);
    } catch (error) {
      const errorResult: ApiCallResult = {
        ...result,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      logResult(errorResult);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="debug-page">
      <div className="debug-header">
        <h1>API Diagnostics</h1>
        <p className="debug-subtitle">Development-only diagnostic tool for API testing</p>
      </div>

      {!user ? (
        <div className="debug-auth-warning">
          <h2>⚠️ Authentication Required</h2>
          <p>Please sign in to test authenticated API endpoints.</p>
          <p>Visit the <a href="/login">Login page</a> to authenticate.</p>
        </div>
      ) : (
        <div className="debug-auth-info">
          <h3>Authentication Status</h3>
          <div className="debug-info-grid">
            <div className="debug-info-item">
              <span className="debug-label">User:</span>
              <span className="debug-value">{user.email || user.displayName || 'Anonymous'}</span>
            </div>
            <div className="debug-info-item">
              <span className="debug-label">User ID:</span>
              <span className="debug-value">{uid || 'N/A'}</span>
            </div>
            <div className="debug-info-item">
              <span className="debug-label">Auth State:</span>
              <span className="debug-value debug-success">✓ Authenticated</span>
            </div>
          </div>
        </div>
      )}

      <div className="debug-controls">
        <h3>API Test Controls</h3>
        <div className="debug-verbose-toggle">
          <label htmlFor="verbose-logging">
            <input
              id="verbose-logging"
              type="checkbox"
              checked={verboseLogging}
              onChange={(e) => setVerboseLogging(e.target.checked)}
            />
            <span>Enable verbose console logging</span>
          </label>
        </div>
        <div className="debug-buttons">
          <button onClick={callDungeonMasterHealth} className="debug-button">
            Test Dungeon Master /health
          </button>
          <button onClick={callJourneyLogHealth} className="debug-button">
            Test Journey Log /health
          </button>
          <button onClick={callJourneyLogInfo} className="debug-button">
            Test Journey Log /info
          </button>
          <button onClick={clearResults} className="debug-button debug-button-secondary">
            Clear Results
          </button>
        </div>
      </div>

      <div className="debug-results">
        <h3>Recent API Calls</h3>
        {results.length === 0 ? (
          <p className="debug-empty">No API calls yet. Click a button above to test an endpoint.</p>
        ) : (
          <div className="debug-results-list">
            {results.map((result, index) => (
              <div key={index} className={`debug-result-item debug-result-${result.status}`}>
                <div className="debug-result-header">
                  <span className="debug-result-service">{result.service}</span>
                  <span className="debug-result-endpoint">{result.endpoint}</span>
                  <span className="debug-result-time">{result.timestamp && formatTimestamp(result.timestamp)}</span>
                </div>
                <div className="debug-result-body">
                  <div className="debug-result-status">
                    <span className="debug-label">Status:</span>
                    <span className={`debug-badge debug-badge-${result.status}`}>
                      {result.status.toUpperCase()}
                    </span>
                    {result.statusCode && (
                      <span className="debug-status-code">{result.statusCode}</span>
                    )}
                  </div>
                  {result.headers && Object.keys(result.headers).length > 0 && (
                    <div className="debug-result-headers">
                      <span className="debug-label">Headers Sent:</span>
                      <div className="debug-headers-list">
                        {Object.entries(result.headers).map(([key, value]) => (
                          <div key={key} className="debug-header-item">
                            <span className="debug-header-key">{key}:</span>
                            <span className="debug-header-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.data !== undefined && (
                    <div className="debug-result-data">
                      <span className="debug-label">Response:</span>
                      <pre className="debug-json">{JSON.stringify(result.data, null, 2)}</pre>
                    </div>
                  )}
                  {result.error && (
                    <div className="debug-result-error">
                      <span className="debug-label">Error:</span>
                      <span className="debug-error-message">{result.error}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
