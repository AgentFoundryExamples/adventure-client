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
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setAuthProvider,
  getAuthProvider,
  httpClient,
  dungeonMasterClient,
  journeyLogClient,
  type AuthProvider,
} from '../client';

// Mock config module
vi.mock('../../../config/env', () => ({
  config: {
    dungeonMasterApiUrl: 'https://dungeon-master.example.com',
    journeyLogApiUrl: 'https://journey-log.example.com',
    isDevelopment: false, // Set to false to avoid console logs in tests
    isProduction: true,
  },
}));

describe('client', () => {
  const mockAuthProvider: AuthProvider = {
    getIdToken: vi.fn().mockResolvedValue('mock-token'),
    uid: 'mock-uid-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setAuthProvider(null);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setAuthProvider and getAuthProvider', () => {
    it('sets and gets auth provider', () => {
      setAuthProvider(mockAuthProvider);
      expect(getAuthProvider()).toBe(mockAuthProvider);
    });

    it('clears auth provider', () => {
      setAuthProvider(mockAuthProvider);
      setAuthProvider(null);
      expect(getAuthProvider()).toBeNull();
    });
  });

  describe('httpClient.get', () => {
    it('makes GET request with default base URL', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await httpClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://dungeon-master.example.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('calls getIdToken for dungeon-master API when auth is set', async () => {
      setAuthProvider(mockAuthProvider);
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
        })
      );

      const result = await httpClient.get('/test', {
        baseUrl: 'https://dungeon-master.example.com',
      });

      expect(result).toEqual(mockResponse);
      expect(mockAuthProvider.getIdToken).toHaveBeenCalledWith(false);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('calls getIdToken and adds X-User-Id for journey-log API when auth is set', async () => {
      setAuthProvider(mockAuthProvider);
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
        })
      );

      const result = await httpClient.get('/test', {
        baseUrl: 'https://journey-log.example.com',
      });

      expect(result).toEqual(mockResponse);
      expect(mockAuthProvider.getIdToken).toHaveBeenCalledWith(false);
      
      // Verify X-User-Id header was added
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].headers['X-User-Id']).toBe('mock-uid-123');
    });

    it('skips auth when skipAuth is true', async () => {
      setAuthProvider(mockAuthProvider);
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
        })
      );

      await httpClient.get('/test', { skipAuth: true });

      expect(mockAuthProvider.getIdToken).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });

    it('retries with refreshed token on 401', async () => {
      setAuthProvider(mockAuthProvider);

      // First call returns 401
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
        })
      );

      // Second call succeeds
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
        })
      );

      const result = await httpClient.get('/test', {
        baseUrl: 'https://dungeon-master.example.com',
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockAuthProvider.getIdToken).toHaveBeenCalledWith(false); // First call
      expect(mockAuthProvider.getIdToken).toHaveBeenCalledWith(true); // Retry with refresh
      expect(result).toEqual(mockResponse);
    });

    it('throws ApiError on non-2xx response', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          statusText: 'Not Found',
        })
      );

      await expect(httpClient.get('/test')).rejects.toMatchObject({
        status: 404,
        statusText: 'Not Found',
        message: 'HTTP 404: Not Found',
      });
    });

    it('handles empty response', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        })
      );

      const result = await httpClient.get('/test');

      expect(result).toBeUndefined();
    });
  });

  describe('httpClient.post', () => {
    it('makes POST request with body', async () => {
      const mockResponse = { id: 1 };
      const requestBody = { name: 'test' };
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 201,
        })
      );

      const result = await httpClient.post('/test', requestBody);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('dungeonMasterClient', () => {
    it('uses dungeon master base URL', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
        })
      );

      await dungeonMasterClient.get('/turns');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://dungeon-master.example.com/turns',
        expect.any(Object)
      );
    });
  });

  describe('journeyLogClient', () => {
    it('uses journey log base URL', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
        })
      );

      await journeyLogClient.get('/characters');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://journey-log.example.com/characters',
        expect.any(Object)
      );
    });
  });
});
