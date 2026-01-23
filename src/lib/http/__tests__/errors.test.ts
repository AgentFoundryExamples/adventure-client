// Copyright 2025 John Brosnihan
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createApiError,
  isApiError,
  logHttpError,
  transformResponseToError,
  wrapError,
  getHttpErrorMessage,
  isTransientError,
  getFriendlyErrorMessage,
  type ApiError,
} from '../errors';

// Mock config module
vi.mock('../../../config/env', () => ({
  config: {
    isDevelopment: true,
    isProduction: false,
  },
}));

describe('errors', () => {
  describe('createApiError', () => {
    it('creates an ApiError with all properties', () => {
      const error = createApiError('Test error', 404, 'Not Found', { detail: 'test' });

      expect(error).toEqual({
        message: 'Test error',
        status: 404,
        statusText: 'Not Found',
        data: { detail: 'test' },
      });
    });

    it('creates an ApiError without data', () => {
      const error = createApiError('Test error', 500, 'Internal Server Error');

      expect(error).toEqual({
        message: 'Test error',
        status: 500,
        statusText: 'Internal Server Error',
        data: undefined,
      });
    });
  });

  describe('isApiError', () => {
    it('returns true for valid ApiError', () => {
      const error: ApiError = {
        message: 'Test',
        status: 404,
        statusText: 'Not Found',
      };

      expect(isApiError(error)).toBe(true);
    });

    it('returns false for Error', () => {
      const error = new Error('Test');
      expect(isApiError(error)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isApiError(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isApiError(undefined)).toBe(false);
    });

    it('returns false for incomplete object', () => {
      expect(isApiError({ message: 'Test' })).toBe(false);
      expect(isApiError({ status: 404 })).toBe(false);
    });
  });

  describe('logHttpError', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('logs 5xx errors with console.error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = createApiError('Server error', 500, 'Internal Server Error');

      logHttpError(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[HTTP Client] Server error (500):',
        error
      );
      consoleSpy.mockRestore();
    });

    it('logs 4xx errors with console.warn', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = createApiError('Not found', 404, 'Not Found');

      logHttpError(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[HTTP Client] Client error (404):',
        error
      );
      consoleSpy.mockRestore();
    });

    it('logs other errors with console.log', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const error = createApiError('Redirect', 301, 'Moved Permanently');

      logHttpError(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[HTTP Client] Request failed (301):',
        error
      );
      consoleSpy.mockRestore();
    });

    it('includes context in log message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = createApiError('Server error', 500, 'Internal Server Error');

      logHttpError(error, 'dungeon-master');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[HTTP Client - dungeon-master] Server error (500):',
        error
      );
      consoleSpy.mockRestore();
    });
  });

  describe('transformResponseToError', () => {
    it('transforms response with JSON body', async () => {
      const response = new Response(JSON.stringify({ detail: 'test error' }), {
        status: 400,
        statusText: 'Bad Request',
      });

      const error = await transformResponseToError(response);

      expect(error).toEqual({
        message: 'HTTP 400: Bad Request',
        status: 400,
        statusText: 'Bad Request',
        data: { detail: 'test error' },
      });
    });

    it('transforms response with text body', async () => {
      const response = new Response('Plain text error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      const error = await transformResponseToError(response);

      expect(error.message).toBe('HTTP 500: Internal Server Error');
      expect(error.status).toBe(500);
      expect(error.statusText).toBe('Internal Server Error');
      // The data could be either text or null depending on Response implementation
      expect(error.data).toBeDefined();
    });

    it('transforms response with no body', async () => {
      const response = new Response(null, {
        status: 404,
        statusText: 'Not Found',
      });

      const error = await transformResponseToError(response);

      expect(error.message).toBe('HTTP 404: Not Found');
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
      // The data could be null or empty string depending on Response implementation
      expect([null, '']).toContain(error.data);
    });
  });

  describe('wrapError', () => {
    it('returns ApiError unchanged', () => {
      const apiError: ApiError = {
        message: 'Test error',
        status: 404,
        statusText: 'Not Found',
      };

      const result = wrapError(apiError);

      expect(result).toBe(apiError);
    });

    it('wraps Error instance', () => {
      const error = new Error('Network error');

      const result = wrapError(error);

      expect(result).toEqual({
        message: 'Network error',
        status: 0,
        statusText: 'Network Error',
        data: { originalError: 'Network error' },
      });
    });

    it('wraps string error', () => {
      const error = 'Something went wrong';

      const result = wrapError(error);

      expect(result).toEqual({
        message: 'Network request failed',
        status: 0,
        statusText: 'Network Error',
        data: { originalError: 'Something went wrong' },
      });
    });

    it('uses custom default message', () => {
      const error = 'test';

      const result = wrapError(error, 'Custom error message');

      expect(result.message).toBe('Custom error message');
    });
  });

  describe('getHttpErrorMessage', () => {
    it('returns correct message for 400 Bad Request', () => {
      const message = getHttpErrorMessage(400);
      expect(message).toContain('Invalid request');
    });

    it('returns correct message for 401 Unauthorized', () => {
      const message = getHttpErrorMessage(401);
      expect(message).toContain('Authentication failed');
    });

    it('returns correct message for 403 Forbidden', () => {
      const message = getHttpErrorMessage(403);
      expect(message).toContain('Access denied');
    });

    it('returns correct message for 404 Not Found', () => {
      const message = getHttpErrorMessage(404);
      expect(message).toContain('not found');
    });

    it('returns correct message for 408 Request Timeout', () => {
      const message = getHttpErrorMessage(408);
      expect(message).toContain('timeout');
    });

    it('returns correct message for 429 Too Many Requests', () => {
      const message = getHttpErrorMessage(429);
      expect(message).toContain('Too many requests');
    });

    it('returns correct message for 500 Internal Server Error', () => {
      const message = getHttpErrorMessage(500);
      expect(message).toContain('Server error');
    });

    it('returns correct message for 502 Bad Gateway', () => {
      const message = getHttpErrorMessage(502);
      expect(message).toContain('temporarily unavailable');
    });

    it('returns correct message for 503 Service Unavailable', () => {
      const message = getHttpErrorMessage(503);
      expect(message).toContain('maintenance');
    });

    it('returns correct message for 504 Gateway Timeout', () => {
      const message = getHttpErrorMessage(504);
      expect(message).toContain('timeout');
    });

    it('includes context in error message when provided', () => {
      const message = getHttpErrorMessage(404, 'User profile');
      expect(message).toContain('User profile');
      expect(message).toContain('not found');
    });

    it('handles network error (status 0)', () => {
      const message = getHttpErrorMessage(0);
      expect(message).toContain('Network error');
      expect(message).toContain('internet connection');
    });

    it('handles unknown 4xx status codes', () => {
      const message = getHttpErrorMessage(418); // I'm a teapot
      expect(message).toContain('418');
      expect(message).toContain('failed');
    });

    it('handles unknown 5xx status codes', () => {
      const message = getHttpErrorMessage(599);
      expect(message).toContain('599');
      expect(message).toContain('Server error');
    });
  });

  describe('isTransientError', () => {
    it('returns true for 408 Request Timeout', () => {
      expect(isTransientError(408)).toBe(true);
    });

    it('returns true for 429 Too Many Requests', () => {
      expect(isTransientError(429)).toBe(true);
    });

    it('returns true for 500 Internal Server Error', () => {
      expect(isTransientError(500)).toBe(true);
    });

    it('returns true for 502 Bad Gateway', () => {
      expect(isTransientError(502)).toBe(true);
    });

    it('returns true for 503 Service Unavailable', () => {
      expect(isTransientError(503)).toBe(true);
    });

    it('returns true for 504 Gateway Timeout', () => {
      expect(isTransientError(504)).toBe(true);
    });

    it('returns true for network error (status 0)', () => {
      expect(isTransientError(0)).toBe(true);
    });

    it('returns false for 400 Bad Request', () => {
      expect(isTransientError(400)).toBe(false);
    });

    it('returns false for 401 Unauthorized', () => {
      expect(isTransientError(401)).toBe(false);
    });

    it('returns false for 403 Forbidden', () => {
      expect(isTransientError(403)).toBe(false);
    });

    it('returns false for 404 Not Found', () => {
      expect(isTransientError(404)).toBe(false);
    });

    it('returns false for 200 OK', () => {
      expect(isTransientError(200)).toBe(false);
    });
  });

  describe('getFriendlyErrorMessage', () => {
    it('returns message and retry flag for ApiError with transient status', () => {
      const error: ApiError = {
        status: 500,
        message: 'Server Error',
        statusText: 'Internal Server Error',
      };

      const result = getFriendlyErrorMessage(error);

      expect(result.shouldRetry).toBe(true);
      expect(result.message).toContain('Server error');
    });

    it('returns message and retry flag for ApiError with non-transient status', () => {
      const error: ApiError = {
        status: 404,
        message: 'Not Found',
        statusText: 'Not Found',
      };

      const result = getFriendlyErrorMessage(error);

      expect(result.shouldRetry).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('handles Error with timeout message', () => {
      const error = new Error('Request timeout');

      const result = getFriendlyErrorMessage(error);

      expect(result.shouldRetry).toBe(true);
      expect(result.message).toContain('timeout');
    });

    it('handles Error with network message', () => {
      const error = new Error('Failed to fetch');

      const result = getFriendlyErrorMessage(error);

      expect(result.shouldRetry).toBe(true);
      expect(result.message).toContain('Network error');
    });

    it('handles NetworkError by name', () => {
      const error = new Error('Connection lost');
      Object.defineProperty(error, 'name', { value: 'NetworkError' });

      const result = getFriendlyErrorMessage(error);

      expect(result.shouldRetry).toBe(true);
      expect(result.message).toContain('Network error');
    });

    it('handles AbortError by name', () => {
      const error = new Error('Operation aborted');
      Object.defineProperty(error, 'name', { value: 'AbortError' });

      const result = getFriendlyErrorMessage(error);

      expect(result.shouldRetry).toBe(true);
      expect(result.message).toContain('timeout');
    });

    it('includes context when provided', () => {
      const error: ApiError = {
        status: 404,
        message: 'Not Found',
        statusText: 'Not Found',
      };

      const result = getFriendlyErrorMessage(error, 'Loading user data');

      expect(result.message).toContain('Loading user data');
    });

    it('handles unknown error types', () => {
      const error = 'Unknown error string';

      const result = getFriendlyErrorMessage(error);

      expect(result.shouldRetry).toBe(false);
      expect(result.message).toContain('unexpected error');
    });

    it('validates that status is actually a number', () => {
      const error = { status: 'not-a-number', message: 'Invalid' };

      const result = getFriendlyErrorMessage(error);

      // Should not crash, should handle gracefully
      expect(result.shouldRetry).toBe(false);
      expect(result.message).toContain('unexpected error');
    });
  });
});
