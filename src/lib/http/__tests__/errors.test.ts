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
});
