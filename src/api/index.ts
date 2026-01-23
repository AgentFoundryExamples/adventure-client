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
import { OpenAPI as DungeonMasterOpenAPI, GameService } from './dungeonMaster';
import { OpenAPI as JourneyLogOpenAPI } from './journeyLog';
import type { AuthProvider } from '@/lib/http/client';
import type { CharacterCreationRequest, CharacterCreationResponse } from './dungeonMaster';

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
export { GameService };
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
 * - `X-Dev-User-Id: <user-id>` (optional, DEVELOPMENT ONLY - must be disabled in production)
 * 
 * ⚠️ **SECURITY WARNING:** The xDevUserId parameter should ONLY be used in development.
 * This bypasses authentication and allows user impersonation. Ensure the backend service
 * ignores this header in production environments.
 * 
 * @param request - Character creation request with name, race, class_name, and optional custom_prompt
 * @param xDevUserId - Optional development user ID override (ONLY for development, null in production)
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
  request: CharacterCreationRequest,
  xDevUserId?: string | null
): Promise<CharacterCreationResponse> {
  return GameService.createCharacterCharactersPost({
    requestBody: request,
    xDevUserId: xDevUserId ?? null,
  });
}

/**
 * Submit a turn action for a character and receive an AI-generated narrative response.
 * 
 * This function calls the dungeon-master service which:
 * 1. Retrieves character context from journey-log service
 * 2. Generates an AI narrative response using OpenAI GPT
 * 3. Automatically persists the turn to journey-log service
 * 4. Returns the narrative response with optional structured intents and subsystem summaries
 * 
 * **Required Parameters:**
 * - `character_id`: UUID of the character (must be non-empty)
 * - `user_action`: The player's action or input for this turn (must be non-empty)
 * 
 * **Authentication:**
 * Requires Firebase authentication token (automatically added via configureApiClients).
 * 
 * **Headers:**
 * - `Authorization: Bearer <token>` (automatic)
 * - `X-Dev-User-Id: <user-id>` (optional, DEVELOPMENT ONLY - must be disabled in production)
 * 
 * ⚠️ **SECURITY WARNING:** The xDevUserId parameter should ONLY be used in development.
 * This bypasses authentication and allows user impersonation. Ensure the backend service
 * ignores this header in production environments.
 * 
 * @param request - Turn request with character_id and user_action
 * @param xDevUserId - Optional development user ID override (ONLY for development, null in production)
 * @returns Promise resolving to narrative response with optional intents and subsystem summaries
 * @throws ApiError with status 400 for invalid request (malformed UUID, etc.)
 * @throws ApiError with status 404 if character not found
 * @throws ApiError with status 422 for validation errors
 * @throws ApiError with status 429 for rate limit exceeded
 * @throws ApiError with status 401 for authentication failures
 * @throws ApiError with status 500 for server errors
 * 
 * @example
 * ```typescript
 * import { submitTurn } from '@/api';
 * 
 * const response = await submitTurn({
 *   character_id: "550e8400-e29b-41d4-a716-446655440000",
 *   user_action: "I draw my sword and approach the ancient door cautiously."
 * });
 * 
 * console.log(response.narrative);  // "As you approach, ancient runes begin to glow..."
 * if (response.intents) {
 *   console.log(response.intents);  // Structured intents from LLM
 * }
 * ```
 * 
 * @see TurnRequest for request schema
 * @see TurnResponse for response schema
 */
export async function submitTurn(
  request: TurnRequest,
  xDevUserId?: string | null
): Promise<TurnResponse> {
  return GameService.processTurnTurnPost({
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
