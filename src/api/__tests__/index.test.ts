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
    isDevelopment: true,
    isProduction: false,
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

  describe('getUserCharacters', () => {
    it('successfully retrieves user characters', async () => {
      const mockAuthProvider: AuthProvider = {
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
        uid: 'mock-uid-123',
      };
      configureApiClients(mockAuthProvider);

      const { getUserCharacters } = await import('../index');
      const { CharactersService } = await import('../journeyLog');
      
      const mockResponse = {
        characters: [
          { character_id: 'char1', name: 'Hero', race: 'Human', class: 'Warrior', status: 'Healthy' as const, created_at: '2024-01-01', updated_at: '2024-01-02' },
          { character_id: 'char2', name: 'Mage', race: 'Elf', class: 'Wizard', status: 'Healthy' as const, created_at: '2024-01-03', updated_at: '2024-01-04' }
        ],
        count: 2
      };

      vi.spyOn(CharactersService, 'listCharactersCharactersGet').mockResolvedValue(mockResponse);

      const result = await getUserCharacters();

      expect(result).toEqual(mockResponse);
      expect(result.count).toBe(2);
      expect(result.characters).toHaveLength(2);
      expect(CharactersService.listCharactersCharactersGet).toHaveBeenCalledWith({
        xUserId: 'mock-uid-123'
      });
    });

    it('handles empty character list', async () => {
      const mockAuthProvider: AuthProvider = {
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
        uid: 'mock-uid-123',
      };
      configureApiClients(mockAuthProvider);

      const { getUserCharacters } = await import('../index');
      const { CharactersService } = await import('../journeyLog');
      
      const mockResponse = {
        characters: [],
        count: 0
      };

      vi.spyOn(CharactersService, 'listCharactersCharactersGet').mockResolvedValue(mockResponse);

      const result = await getUserCharacters();

      expect(result.count).toBe(0);
      expect(result.characters).toHaveLength(0);
    });

    it('throws error when X-User-Id is not configured', async () => {
      configureApiClients(null);
      const { getUserCharacters } = await import('../index');

      await expect(getUserCharacters()).rejects.toThrow('X-User-Id header is required but not configured');
    });

    it('propagates API errors', async () => {
      const mockAuthProvider: AuthProvider = {
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
        uid: 'mock-uid-123',
      };
      configureApiClients(mockAuthProvider);

      const { getUserCharacters } = await import('../index');
      const { CharactersService, ApiError } = await import('../journeyLog');
      
      const mockError = new ApiError(
        {} as any,
        {
          url: '/characters',
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          body: { detail: 'Invalid authentication' }
        },
        'Invalid authentication'
      );

      vi.spyOn(CharactersService, 'listCharactersCharactersGet').mockRejectedValue(mockError);

      await expect(getUserCharacters()).rejects.toThrow(mockError);
    });
  });

  describe('getCharacterLastTurn', () => {
    it('successfully retrieves last turn', async () => {
      const mockAuthProvider: AuthProvider = {
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
        uid: 'mock-uid-123',
      };
      configureApiClients(mockAuthProvider);

      const { getCharacterLastTurn } = await import('../index');
      const { CharactersService } = await import('../journeyLog');
      
      const mockResponse = {
        turns: [
          {
            turn_id: 'turn1',
            character_id: 'char1',
            player_action: 'Enter the dungeon',
            gm_response: 'You enter the dungeon...',
            timestamp: '2024-01-01T12:00:00Z'
          }
        ],
        metadata: {
          requested_n: 1,
          returned_count: 1,
          total_available: 10
        }
      };

      vi.spyOn(CharactersService, 'getNarrativeTurnsCharactersCharacterIdNarrativeGet').mockResolvedValue(mockResponse);

      const result = await getCharacterLastTurn('char1');

      expect(result).toEqual(mockResponse);
      expect(result.turns).toHaveLength(1);
      expect(result.metadata.returned_count).toBe(1);
      expect(CharactersService.getNarrativeTurnsCharactersCharacterIdNarrativeGet).toHaveBeenCalledWith({
        characterId: 'char1',
        n: 1,
        xUserId: 'mock-uid-123'
      });
    });

    it('handles empty narrative turns', async () => {
      const mockAuthProvider: AuthProvider = {
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
        uid: 'mock-uid-123',
      };
      configureApiClients(mockAuthProvider);

      const { getCharacterLastTurn } = await import('../index');
      const { CharactersService } = await import('../journeyLog');
      
      const mockResponse = {
        turns: [],
        metadata: {
          requested_n: 1,
          returned_count: 0,
          total_available: 0
        }
      };

      vi.spyOn(CharactersService, 'getNarrativeTurnsCharactersCharacterIdNarrativeGet').mockResolvedValue(mockResponse);

      const result = await getCharacterLastTurn('char1');

      expect(result.turns).toHaveLength(0);
      expect(result.metadata.returned_count).toBe(0);
    });

    it('rejects empty characterId', async () => {
      const { getCharacterLastTurn } = await import('../index');

      await expect(getCharacterLastTurn('')).rejects.toThrow('characterId is required and must be non-empty');
      await expect(getCharacterLastTurn('   ')).rejects.toThrow('characterId is required and must be non-empty');
    });

    it('works without X-User-Id (anonymous access)', async () => {
      configureApiClients(null);
      const { getCharacterLastTurn } = await import('../index');
      const { CharactersService } = await import('../journeyLog');
      
      const mockResponse = {
        turns: [{ turn_id: 'turn1', character_id: 'char1', player_action: 'Test action', gm_response: 'Test response', timestamp: '2024-01-01' }],
        metadata: { requested_n: 1, returned_count: 1, total_available: 1 }
      };

      vi.spyOn(CharactersService, 'getNarrativeTurnsCharactersCharacterIdNarrativeGet').mockResolvedValue(mockResponse);

      const result = await getCharacterLastTurn('char1');

      expect(result).toEqual(mockResponse);
      expect(CharactersService.getNarrativeTurnsCharactersCharacterIdNarrativeGet).toHaveBeenCalledWith({
        characterId: 'char1',
        n: 1,
        xUserId: null
      });
    });

    it('propagates 404 not found errors', async () => {
      const mockAuthProvider: AuthProvider = {
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
        uid: 'mock-uid-123',
      };
      configureApiClients(mockAuthProvider);

      const { getCharacterLastTurn } = await import('../index');
      const { CharactersService, ApiError } = await import('../journeyLog');
      
      const mockError = new ApiError(
        {} as any,
        {
          url: '/characters/invalid/narrative',
          ok: false,
          status: 404,
          statusText: 'Not Found',
          body: { detail: 'Character not found' }
        },
        'Character not found'
      );

      vi.spyOn(CharactersService, 'getNarrativeTurnsCharactersCharacterIdNarrativeGet').mockRejectedValue(mockError);

      await expect(getCharacterLastTurn('invalid')).rejects.toThrow(mockError);
    });

    it('propagates 403 forbidden errors (mismatched user)', async () => {
      const mockAuthProvider: AuthProvider = {
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
        uid: 'mock-uid-123',
      };
      configureApiClients(mockAuthProvider);

      const { getCharacterLastTurn } = await import('../index');
      const { CharactersService, ApiError } = await import('../journeyLog');
      
      const mockError = new ApiError(
        {} as any,
        {
          url: '/characters/char1/narrative',
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          body: { detail: 'X-User-Id does not match character owner' }
        },
        'X-User-Id does not match character owner'
      );

      vi.spyOn(CharactersService, 'getNarrativeTurnsCharactersCharacterIdNarrativeGet').mockRejectedValue(mockError);

      await expect(getCharacterLastTurn('char1')).rejects.toThrow(mockError);
    });
  });

  describe('submitTurn', () => {
    let mockAuthProvider: AuthProvider;

    beforeEach(() => {
      mockAuthProvider = {
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
        uid: 'mock-uid-123',
      };
      configureApiClients(mockAuthProvider);
    });

    it('successfully submits a turn', async () => {
      const { submitTurn } = await import('../index');
      const { GameService } = await import('../dungeonMaster');
      
      const mockResponse = {
        narrative: 'You enter the dungeon and see a dragon sleeping.',
        intents: null,
        subsystem_summary: null
      };

      vi.spyOn(GameService, 'processTurnTurnPost').mockResolvedValue(mockResponse);

      const result = await submitTurn({
        character_id: 'char-uuid-123',
        user_action: 'I enter the dungeon carefully'
      });

      expect(result).toEqual(mockResponse);
      expect(result.narrative).toBe('You enter the dungeon and see a dragon sleeping.');
      expect(GameService.processTurnTurnPost).toHaveBeenCalledWith({
        requestBody: {
          character_id: 'char-uuid-123',
          user_action: 'I enter the dungeon carefully'
        },
        xDevUserId: null
      });
    });

    it('verifies Authorization Bearer token is injected via OpenAPI config', async () => {
      const { submitTurn } = await import('../index');
      const { GameService } = await import('../dungeonMaster');
      
      const mockResponse = {
        narrative: 'Test narrative',
        intents: null,
        subsystem_summary: null
      };

      vi.spyOn(GameService, 'processTurnTurnPost').mockResolvedValue(mockResponse);

      await submitTurn({
        character_id: 'char-uuid-123',
        user_action: 'Test action'
      });

      // Verify the token resolver is configured on DungeonMasterOpenAPI
      // The actual token injection happens inside the OpenAPI generated client
      expect(DungeonMasterOpenAPI.TOKEN).toBeDefined();
      expect(typeof DungeonMasterOpenAPI.TOKEN).toBe('function');
      
      // Verify BASE URL is configured
      expect(DungeonMasterOpenAPI.BASE).toBe('https://dungeon-master.example.com');
    });

    it('submits turn with X-Dev-User-Id header in development', async () => {
      const { submitTurn } = await import('../index');
      const { GameService } = await import('../dungeonMaster');
      
      const mockResponse = {
        narrative: 'Test narrative',
        intents: null,
        subsystem_summary: null
      };

      vi.spyOn(GameService, 'processTurnTurnPost').mockResolvedValue(mockResponse);

      await submitTurn(
        {
          character_id: 'char-uuid-123',
          user_action: 'Test action'
        },
        'dev-user-override'
      );

      expect(GameService.processTurnTurnPost).toHaveBeenCalledWith({
        requestBody: {
          character_id: 'char-uuid-123',
          user_action: 'Test action'
        },
        xDevUserId: 'dev-user-override'
      });
    });

    it('blocks X-Dev-User-Id in production mode', async () => {
      // Temporarily modify the config to simulate production
      const { config } = await import('../../config/env');
      const originalIsProduction = config.isProduction;
      Object.defineProperty(config, 'isProduction', {
        value: true,
        writable: true,
        configurable: true
      });
      
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { submitTurn } = await import('../index');
      const { GameService } = await import('../dungeonMaster');
      
      const mockResponse = {
        narrative: 'Test narrative',
        intents: null,
        subsystem_summary: null
      };

      vi.spyOn(GameService, 'processTurnTurnPost').mockResolvedValue(mockResponse);

      await submitTurn(
        {
          character_id: 'char-uuid-123',
          user_action: 'Test action'
        },
        'dev-user-override-should-be-ignored'
      );

      // Verify xDevUserId is null in production
      expect(GameService.processTurnTurnPost).toHaveBeenCalledWith({
        requestBody: {
          character_id: 'char-uuid-123',
          user_action: 'Test action'
        },
        xDevUserId: null
      });

      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'xDevUserId is ignored in production builds for security reasons.'
      );

      // Restore original value
      Object.defineProperty(config, 'isProduction', {
        value: originalIsProduction,
        writable: true,
        configurable: true
      });
      
      consoleWarnSpy.mockRestore();
    });

    it('includes structured intents when returned', async () => {
      const { submitTurn } = await import('../index');
      const { GameService } = await import('../dungeonMaster');
      
      const mockResponse = {
        narrative: 'You cast a fireball at the enemy.',
        intents: {
          combat: { type: 'attack', target: 'enemy', weapon: 'fireball' }
        },
        subsystem_summary: {
          combat: { success: true, damage: 25 }
        }
      };

      vi.spyOn(GameService, 'processTurnTurnPost').mockResolvedValue(mockResponse);

      const result = await submitTurn({
        character_id: 'char-uuid-123',
        user_action: 'I cast fireball at the enemy'
      });

      expect(result.intents).toBeDefined();
      expect(result.subsystem_summary).toBeDefined();
    });

    it('propagates 400 bad request errors', async () => {
      const { submitTurn } = await import('../index');
      const { GameService, ApiError } = await import('../dungeonMaster');
      
      const mockError = new ApiError(
        {} as any,
        {
          url: '/turn',
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          body: { detail: 'Malformed UUID' }
        },
        'Malformed UUID'
      );

      vi.spyOn(GameService, 'processTurnTurnPost').mockRejectedValue(mockError);

      await expect(submitTurn({
        character_id: 'invalid-uuid',
        user_action: 'Test action'
      })).rejects.toThrow(mockError);
    });

    it('propagates 404 not found errors', async () => {
      const { submitTurn } = await import('../index');
      const { GameService, ApiError } = await import('../dungeonMaster');
      
      const mockError = new ApiError(
        {} as any,
        {
          url: '/turn',
          ok: false,
          status: 404,
          statusText: 'Not Found',
          body: { detail: 'Character not found' }
        },
        'Character not found'
      );

      vi.spyOn(GameService, 'processTurnTurnPost').mockRejectedValue(mockError);

      await expect(submitTurn({
        character_id: 'nonexistent-char',
        user_action: 'Test action'
      })).rejects.toThrow(mockError);
    });

    it('propagates 422 validation errors', async () => {
      const { submitTurn } = await import('../index');
      const { GameService, ApiError } = await import('../dungeonMaster');
      
      const mockError = new ApiError(
        {} as any,
        {
          url: '/turn',
          ok: false,
          status: 422,
          statusText: 'Unprocessable Entity',
          body: { detail: 'Validation failed' }
        },
        'Validation failed'
      );

      vi.spyOn(GameService, 'processTurnTurnPost').mockRejectedValue(mockError);

      await expect(submitTurn({
        character_id: '',
        user_action: ''
      })).rejects.toThrow(mockError);
    });

    it('propagates 429 rate limit errors', async () => {
      const { submitTurn } = await import('../index');
      const { GameService, ApiError } = await import('../dungeonMaster');
      
      const mockError = new ApiError(
        {} as any,
        {
          url: '/turn',
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          body: { detail: 'Rate limit exceeded' }
        },
        'Rate limit exceeded'
      );

      vi.spyOn(GameService, 'processTurnTurnPost').mockRejectedValue(mockError);

      await expect(submitTurn({
        character_id: 'char-uuid-123',
        user_action: 'Test action'
      })).rejects.toThrow(mockError);
    });

    it('propagates 401 authentication errors', async () => {
      const { submitTurn } = await import('../index');
      const { GameService, ApiError } = await import('../dungeonMaster');
      
      const mockError = new ApiError(
        {} as any,
        {
          url: '/turn',
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          body: { detail: 'Invalid authentication' }
        },
        'Invalid authentication'
      );

      vi.spyOn(GameService, 'processTurnTurnPost').mockRejectedValue(mockError);

      await expect(submitTurn({
        character_id: 'char-uuid-123',
        user_action: 'Test action'
      })).rejects.toThrow(mockError);
    });

    it('propagates 500 server errors', async () => {
      const { submitTurn } = await import('../index');
      const { GameService, ApiError } = await import('../dungeonMaster');
      
      const mockError = new ApiError(
        {} as any,
        {
          url: '/turn',
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          body: { detail: 'Internal server error' }
        },
        'Internal server error'
      );

      vi.spyOn(GameService, 'processTurnTurnPost').mockRejectedValue(mockError);

      await expect(submitTurn({
        character_id: 'char-uuid-123',
        user_action: 'Test action'
      })).rejects.toThrow(mockError);
    });
  });
});
