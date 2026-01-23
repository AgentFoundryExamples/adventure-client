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
/**
 * API Client Configuration
 * Configures and exports OpenAPI-generated clients with auth integration
 */

import { config } from '@/config/env';
import { OpenAPI as DungeonMasterOpenAPI } from './dungeonMaster';
import { OpenAPI as JourneyLogOpenAPI } from './journeyLog';
import type { AuthProvider } from '@/lib/http/client';

/**
 * Configures OpenAPI clients with base URLs and auth token resolvers
 * @param authProvider - Auth provider instance from AuthContext
 */
export function configureApiClients(authProvider: AuthProvider | null): void {
  // Configure Dungeon Master API client
  DungeonMasterOpenAPI.BASE = config.dungeonMasterApiUrl;
  DungeonMasterOpenAPI.TOKEN = authProvider
    ? async () => {
        const token = await authProvider.getIdToken();
        if (!token) {
          throw new Error('Authentication required but no token available');
        }
        return token;
      }
    : undefined;

  // Configure Journey Log API client
  JourneyLogOpenAPI.BASE = config.journeyLogApiUrl;
  JourneyLogOpenAPI.TOKEN = authProvider
    ? async () => {
        const token = await authProvider.getIdToken();
        if (!token) {
          throw new Error('Authentication required but no token available');
        }
        return token;
      }
    : undefined;

  // Set up custom headers for Journey Log (X-User-Id)
  JourneyLogOpenAPI.HEADERS = authProvider
    ? async () => {
        const headers: Record<string, string> = {};
        if (authProvider.uid) {
          headers['X-User-Id'] = authProvider.uid;
        }
        return headers;
      }
    : undefined;
}

// Re-export generated API services for convenience
export { GameService } from './dungeonMaster';
export { CharactersService, DefaultService, OperationsService } from './journeyLog';

// Re-export helper functions
export { getUserCharacters, getCharacterLastTurn } from './journeyLog';

/**
 * Create a new character with an AI-generated opening narrative.
 * 
 * This function calls the dungeon-master service which:
 * 1. Generates an introductory narrative scene using AI (OpenAI GPT)
 * 2. Automatically persists the character to journey-log service
 * 3. Returns the character ID and opening narrative
 * 
 * **Important:** Do NOT manually call journey-log's character creation endpoint
 * after this function, as the dungeon-master service handles that automatically.
 * Calling it manually will result in duplicate character records.
 * 
 * **Required Fields:**
 * - `name`: Character name (1-100 characters)
 * - `race`: Character race (1-50 characters, e.g., "Human", "Elf", "Dwarf")
 * - `class_name`: Character class (1-50 characters, e.g., "Warrior", "Wizard", "Rogue")
 * 
 * **Optional Fields:**
 * - `custom_prompt`: Custom world/setting prompt (0-2000 characters)
 * 
 * **Authentication:**
 * Requires Firebase authentication token (automatically added via configureApiClients).
 * 
 * **Headers:**
 * - `Authorization: Bearer <token>` (automatic)
 * - `X-Dev-User-Id: <user-id>` (optional, for development only)
 * 
 * @param request - Character creation request with name, race, class_name, and optional custom_prompt
 * @param xDevUserId - Optional development user ID override (null in production)
 * @returns Promise resolving to character_id and opening narrative
 * @throws ApiError with status 422 for validation errors
 * @throws ApiError with status 401 for authentication failures
 * @throws ApiError with status 500 for server errors
 * 
 * @example
 * ```typescript
 * import { createCharacter } from '@/api';
 * 
 * const response = await createCharacter({
 *   name: "Thorin Ironforge",
 *   race: "Dwarf",
 *   class_name: "Warrior",
 *   custom_prompt: "A world of underground kingdoms"
 * });
 * 
 * console.log(response.character_id); // UUID of created character
 * console.log(response.narrative);    // Opening scene narrative
 * ```
 * 
 * @see docs/character-creation.md for complete documentation
 */
export async function createCharacter(
  request: import('./dungeonMaster').CharacterCreationRequest,
  xDevUserId?: string | null
): Promise<import('./dungeonMaster').CharacterCreationResponse> {
  const { GameService } = await import('./dungeonMaster');
  return GameService.createCharacterCharactersPost({
    requestBody: request,
    xDevUserId: xDevUserId ?? null,
  });
}

// Re-export commonly used types
export type { 
  TurnRequest, 
  TurnResponse,
  CharacterCreationRequest,
  CharacterCreationResponse 
} from './dungeonMaster';
export type {
  CreateCharacterRequest,
  CreateCharacterResponse,
  GetCharacterResponse,
  CharacterDocument,
  ListCharactersResponse,
  GetNarrativeResponse,
  NarrativeTurn,
} from './journeyLog';
