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
import { configureApiClients, createCharacter } from '../index';
import { OpenAPI as DungeonMasterOpenAPI } from '../dungeonMaster';
import type { AuthProvider } from '@/lib/http/client';
import type { CharacterCreationRequest, CharacterCreationResponse } from '../dungeonMaster';

// Mock config module
vi.mock('../../config/env', () => ({
  config: {
    dungeonMasterApiUrl: 'https://dungeon-master.example.com',
    journeyLogApiUrl: 'https://journey-log.example.com',
  },
}));

describe('Character Creation', () => {
  const mockAuthProvider: AuthProvider = {
    getIdToken: vi.fn().mockResolvedValue('mock-token'),
    uid: 'mock-uid-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    DungeonMasterOpenAPI.BASE = '';
    DungeonMasterOpenAPI.TOKEN = undefined;
    DungeonMasterOpenAPI.HEADERS = undefined;
  });

  describe('createCharacter', () => {
    it('creates a character with all required fields', async () => {
      configureApiClients(mockAuthProvider);

      const { GameService } = await import('../dungeonMaster');
      
      const mockRequest: CharacterCreationRequest = {
        name: 'Thorin Ironforge',
        race: 'Dwarf',
        class_name: 'Warrior',
      };

      const mockResponse: CharacterCreationResponse = {
        character_id: '123e4567-e89b-12d3-a456-426614174000',
        narrative: 'You stand at the entrance of the great underground fortress...',
      };

      vi.spyOn(GameService, 'createCharacterCharactersPost').mockResolvedValue(mockResponse);

      const result = await createCharacter(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(result.character_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.narrative).toBeTruthy();
      expect(GameService.createCharacterCharactersPost).toHaveBeenCalledWith({
        requestBody: mockRequest,
        xDevUserId: null,
      });
    });

    it('creates a character with custom_prompt', async () => {
      configureApiClients(mockAuthProvider);

      const { GameService } = await import('../dungeonMaster');
      
      const mockRequest: CharacterCreationRequest = {
        name: 'Aelthor',
        race: 'Elf',
        class_name: 'Wizard',
        custom_prompt: 'A dark fantasy world where the sun has vanished',
      };

      const mockResponse: CharacterCreationResponse = {
        character_id: '456e7890-e89b-12d3-a456-426614174001',
        narrative: 'In the perpetual twilight, you emerge from the Academy of Shadows...',
      };

      vi.spyOn(GameService, 'createCharacterCharactersPost').mockResolvedValue(mockResponse);

      const result = await createCharacter(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(GameService.createCharacterCharactersPost).toHaveBeenCalledWith({
        requestBody: mockRequest,
        xDevUserId: null,
      });
    });

    it('accepts xDevUserId for development', async () => {
      configureApiClients(mockAuthProvider);

      const { GameService } = await import('../dungeonMaster');
      
      const mockRequest: CharacterCreationRequest = {
        name: 'Grom',
        race: 'Orc',
        class_name: 'Barbarian',
      };

      const mockResponse: CharacterCreationResponse = {
        character_id: '789e0123-e89b-12d3-a456-426614174002',
        narrative: 'The war drums echo in the distance as you sharpen your blade...',
      };

      vi.spyOn(GameService, 'createCharacterCharactersPost').mockResolvedValue(mockResponse);

      const result = await createCharacter(mockRequest, 'dev-user-456');

      expect(result).toEqual(mockResponse);
      expect(GameService.createCharacterCharactersPost).toHaveBeenCalledWith({
        requestBody: mockRequest,
        xDevUserId: 'dev-user-456',
      });
    });

    it('handles validation errors (422)', async () => {
      configureApiClients(mockAuthProvider);

      const { GameService, ApiError } = await import('../dungeonMaster');
      
      const mockRequest: CharacterCreationRequest = {
        name: '', // Invalid: empty name
        race: 'Human',
        class_name: 'Warrior',
      };

      const mockError = new ApiError(
        {
          method: 'POST',
          url: '/characters',
          headers: { 'Content-Type': 'application/json' },
          body: mockRequest,
          mediaType: 'application/json',
        },
        {
          url: '/characters',
          ok: false,
          status: 422,
          statusText: 'Unprocessable Entity',
          body: {
            detail: [
              {
                loc: ['body', 'name'],
                msg: 'ensure this value has at least 1 characters',
                type: 'value_error.any_str.min_length',
              },
            ],
          },
        },
        'Validation Error'
      );

      vi.spyOn(GameService, 'createCharacterCharactersPost').mockRejectedValue(mockError);

      await expect(createCharacter(mockRequest)).rejects.toThrow(mockError);
    });

    it('handles authentication errors (401)', async () => {
      const authProviderWithInvalidToken: AuthProvider = {
        getIdToken: vi.fn().mockResolvedValue('invalid-token'),
        uid: 'mock-uid-123',
      };
      configureApiClients(authProviderWithInvalidToken);

      const { GameService, ApiError } = await import('../dungeonMaster');
      
      const mockRequest: CharacterCreationRequest = {
        name: 'Hero',
        race: 'Human',
        class_name: 'Knight',
      };

      const mockError = new ApiError(
        {
          method: 'POST',
          url: '/characters',
          headers: { 'Content-Type': 'application/json' },
          body: mockRequest,
          mediaType: 'application/json',
        },
        {
          url: '/characters',
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          body: { detail: 'Invalid authentication token' },
        },
        'Invalid authentication token'
      );

      vi.spyOn(GameService, 'createCharacterCharactersPost').mockRejectedValue(mockError);

      await expect(createCharacter(mockRequest)).rejects.toThrow(mockError);
    });

    it('handles server errors (500)', async () => {
      configureApiClients(mockAuthProvider);

      const { GameService, ApiError } = await import('../dungeonMaster');
      
      const mockRequest: CharacterCreationRequest = {
        name: 'Adventurer',
        race: 'Halfling',
        class_name: 'Rogue',
      };

      const mockError = new ApiError(
        {
          method: 'POST',
          url: '/characters',
          headers: { 'Content-Type': 'application/json' },
          body: mockRequest,
          mediaType: 'application/json',
        },
        {
          url: '/characters',
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          body: { detail: 'OpenAI API unavailable' },
        },
        'Internal Server Error'
      );

      vi.spyOn(GameService, 'createCharacterCharactersPost').mockRejectedValue(mockError);

      await expect(createCharacter(mockRequest)).rejects.toThrow(mockError);
    });

    it('handles null custom_prompt', async () => {
      configureApiClients(mockAuthProvider);

      const { GameService } = await import('../dungeonMaster');
      
      const mockRequest: CharacterCreationRequest = {
        name: 'Default Hero',
        race: 'Human',
        class_name: 'Fighter',
        custom_prompt: null,
      };

      const mockResponse: CharacterCreationResponse = {
        character_id: 'abc-123',
        narrative: 'Your journey begins...',
      };

      vi.spyOn(GameService, 'createCharacterCharactersPost').mockResolvedValue(mockResponse);

      const result = await createCharacter(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(GameService.createCharacterCharactersPost).toHaveBeenCalledWith({
        requestBody: mockRequest,
        xDevUserId: null,
      });
    });
  });

  describe('CharacterCreationRequest type compliance', () => {
    it('enforces required fields', () => {
      const validRequest: CharacterCreationRequest = {
        name: 'Hero',
        race: 'Human',
        class_name: 'Warrior',
      };

      expect(validRequest.name).toBeTruthy();
      expect(validRequest.race).toBeTruthy();
      expect(validRequest.class_name).toBeTruthy();
    });

    it('allows optional custom_prompt', () => {
      const requestWithPrompt: CharacterCreationRequest = {
        name: 'Hero',
        race: 'Human',
        class_name: 'Warrior',
        custom_prompt: 'Custom world',
      };

      const requestWithoutPrompt: CharacterCreationRequest = {
        name: 'Hero',
        race: 'Human',
        class_name: 'Warrior',
      };

      expect(requestWithPrompt.custom_prompt).toBe('Custom world');
      expect(requestWithoutPrompt.custom_prompt).toBeUndefined();
    });
  });

  describe('CharacterCreationResponse type compliance', () => {
    it('contains character_id and narrative', () => {
      const response: CharacterCreationResponse = {
        character_id: '123',
        narrative: 'Story text',
      };

      expect(response.character_id).toBeTruthy();
      expect(response.narrative).toBeTruthy();
    });
  });

  describe('API integration notes', () => {
    it('documents that dungeon-master handles journey-log writes', () => {
      // This test documents the important architectural decision:
      // The dungeon-master service automatically calls journey-log
      // to persist the character. UI code should NOT manually call
      // journey-log's /characters endpoint after calling dungeon-master.
      
      // Correct flow:
      // 1. Frontend calls createCharacter() (dungeon-master)
      // 2. Dungeon-master internally calls journey-log
      // 3. Frontend receives { character_id, narrative }
      
      // Incorrect flow (DO NOT DO THIS):
      // 1. Frontend calls createCharacter() (dungeon-master)
      // 2. Frontend manually calls journey-log /characters (WRONG!)
      // Result: Duplicate character records
      
      expect(true).toBe(true); // Placeholder for documentation
    });

    it('documents required authentication headers', () => {
      // The dungeon-master character creation endpoint requires:
      // 1. Authorization: Bearer <firebase-id-token> (automatic via TOKEN)
      // 2. X-Dev-User-Id: <user-id> (optional, for development only)
      
      // These are configured via configureApiClients(authProvider)
      
      expect(true).toBe(true); // Placeholder for documentation
    });
  });
});
