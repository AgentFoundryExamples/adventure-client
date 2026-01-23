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
import { configureApiClients } from '../index';
import { OpenAPI as DungeonMasterOpenAPI } from '../dungeonMaster';
import { OpenAPI as JourneyLogOpenAPI } from '../journeyLog';
import type { AuthProvider } from '@/lib/http/client';

// Mock config module
vi.mock('../../config/env', () => ({
  config: {
    dungeonMasterApiUrl: 'https://dungeon-master.example.com',
    journeyLogApiUrl: 'https://journey-log.example.com',
  },
}));

describe('api configuration', () => {
  const mockAuthProvider: AuthProvider = {
    getIdToken: vi.fn().mockResolvedValue('mock-token'),
    uid: 'mock-uid-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset OpenAPI configs
    DungeonMasterOpenAPI.BASE = '';
    DungeonMasterOpenAPI.TOKEN = undefined;
    DungeonMasterOpenAPI.HEADERS = undefined;
    JourneyLogOpenAPI.BASE = '';
    JourneyLogOpenAPI.TOKEN = undefined;
    JourneyLogOpenAPI.HEADERS = undefined;
  });

  describe('configureApiClients', () => {
    it('sets base URLs for both clients', () => {
      configureApiClients(mockAuthProvider);

      expect(DungeonMasterOpenAPI.BASE).toBe('https://dungeon-master.example.com');
      expect(JourneyLogOpenAPI.BASE).toBe('https://journey-log.example.com');
    });

    it('sets token resolver for dungeon master client', async () => {
      configureApiClients(mockAuthProvider);

      expect(DungeonMasterOpenAPI.TOKEN).toBeDefined();
      expect(typeof DungeonMasterOpenAPI.TOKEN).toBe('function');

      const token = await (DungeonMasterOpenAPI.TOKEN as () => Promise<string>)();
      expect(token).toBe('mock-token');
      expect(mockAuthProvider.getIdToken).toHaveBeenCalled();
    });

    it('sets token resolver for journey log client', async () => {
      configureApiClients(mockAuthProvider);

      expect(JourneyLogOpenAPI.TOKEN).toBeDefined();
      expect(typeof JourneyLogOpenAPI.TOKEN).toBe('function');

      const token = await (JourneyLogOpenAPI.TOKEN as () => Promise<string>)();
      expect(token).toBe('mock-token');
      expect(mockAuthProvider.getIdToken).toHaveBeenCalled();
    });

    it('sets custom headers for journey log client', async () => {
      configureApiClients(mockAuthProvider);

      expect(JourneyLogOpenAPI.HEADERS).toBeDefined();
      expect(typeof JourneyLogOpenAPI.HEADERS).toBe('function');

      const headers = await (JourneyLogOpenAPI.HEADERS as () => Promise<Record<string, string>>)();
      expect(headers).toEqual({
        'X-User-Id': 'mock-uid-123',
      });
    });

    it('handles null auth provider', () => {
      configureApiClients(null);

      expect(DungeonMasterOpenAPI.BASE).toBe('https://dungeon-master.example.com');
      expect(JourneyLogOpenAPI.BASE).toBe('https://journey-log.example.com');
      expect(DungeonMasterOpenAPI.TOKEN).toBeUndefined();
      expect(JourneyLogOpenAPI.TOKEN).toBeUndefined();
      expect(JourneyLogOpenAPI.HEADERS).toBeUndefined();
    });

    it('throws error when token is null', async () => {
      const authProviderWithNullToken: AuthProvider = {
        getIdToken: vi.fn().mockResolvedValue(null),
        uid: 'mock-uid',
      };

      configureApiClients(authProviderWithNullToken);

      await expect(
        (DungeonMasterOpenAPI.TOKEN as () => Promise<string>)()
      ).rejects.toThrow('Authentication required but no token available');
    });

    it('handles missing uid in headers', async () => {
      const authProviderWithoutUid: AuthProvider = {
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
        uid: null,
      };

      configureApiClients(authProviderWithoutUid);

      const headers = await (JourneyLogOpenAPI.HEADERS as () => Promise<Record<string, string>>)();
      expect(headers).toEqual({});
    });
  });
});
