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
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export { ApiError } from './core/ApiError';
export { CancelablePromise, CancelError } from './core/CancelablePromise';
export { OpenAPI } from './core/OpenAPI';
export type { OpenAPIConfig } from './core/OpenAPI';

export type { AppendNarrativeRequest } from './models/AppendNarrativeRequest';
export type { AppendNarrativeResponse } from './models/AppendNarrativeResponse';
export type { CharacterContextResponse } from './models/CharacterContextResponse';
export type { CharacterDocument } from './models/CharacterDocument';
export type { CharacterIdentity } from './models/CharacterIdentity';
export type { CharacterMetadata } from './models/CharacterMetadata';
export type { CleanupResponse } from './models/CleanupResponse';
export type { CombatEnvelope } from './models/CombatEnvelope';
export type { CombatState_Input } from './models/CombatState_Input';
export type { CombatState_Output } from './models/CombatState_Output';
export type { ContextCapsMetadata } from './models/ContextCapsMetadata';
export type { CreateCharacterRequest } from './models/CreateCharacterRequest';
export type { CreateCharacterResponse } from './models/CreateCharacterResponse';
export type { CreatePOIRequest } from './models/CreatePOIRequest';
export type { CreatePOIResponse } from './models/CreatePOIResponse';
export type { EnemyState } from './models/EnemyState';
export type { ErrorResponse } from './models/ErrorResponse';
export type { FirestoreTestResponse } from './models/FirestoreTestResponse';
export type { GetCharacterResponse } from './models/GetCharacterResponse';
export type { GetCombatResponse } from './models/GetCombatResponse';
export type { GetNarrativeResponse } from './models/GetNarrativeResponse';
export type { GetPOIsResponse } from './models/GetPOIsResponse';
export type { GetPOISummaryResponse } from './models/GetPOISummaryResponse';
export type { GetQuestResponse } from './models/GetQuestResponse';
export type { GetRandomPOIsResponse } from './models/GetRandomPOIsResponse';
export type { HTTPValidationError } from './models/HTTPValidationError';
export type { InventoryItem } from './models/InventoryItem';
export type { ListCharactersResponse } from './models/ListCharactersResponse';
export type { Location } from './models/Location';
export type { NarrativeContext } from './models/NarrativeContext';
export type { NarrativeMetadata } from './models/NarrativeMetadata';
export type { NarrativeTurn } from './models/NarrativeTurn';
export type { PlayerState } from './models/PlayerState';
export type { PointOfInterest } from './models/PointOfInterest';
export type { Quest } from './models/Quest';
export type { QuestArchiveEntry } from './models/QuestArchiveEntry';
export type { QuestRewards } from './models/QuestRewards';
export type { SetQuestResponse } from './models/SetQuestResponse';
export type { Status } from './models/Status';
export type { UpdateCombatRequest } from './models/UpdateCombatRequest';
export type { UpdateCombatResponse } from './models/UpdateCombatResponse';
export type { UpdatePOIRequest } from './models/UpdatePOIRequest';
export type { UpdatePOIResponse } from './models/UpdatePOIResponse';
export type { ValidationError } from './models/ValidationError';
export type { Weapon } from './models/Weapon';
export type { WorldContextState } from './models/WorldContextState';

export { CharactersService } from './services/CharactersService';
export { DefaultService } from './services/DefaultService';
export { OperationsService } from './services/OperationsService';

/**
 * Helper Functions for Journey Log API
 * These wrappers provide simplified access to common operations with proper typing
 */

import type { ListCharactersResponse } from './models/ListCharactersResponse';
import type { GetNarrativeResponse } from './models/GetNarrativeResponse';
import { CharactersService } from './services/CharactersService';
import { OpenAPI } from './core/OpenAPI';

/**
 * Extracts headers from the OpenAPI configuration.
 * @returns A promise that resolves to the headers object.
 */
async function getOpenApiHeaders(): Promise<Record<string, string>> {
  return typeof OpenAPI.HEADERS === 'function' 
    ? await OpenAPI.HEADERS({} as any)
    : OpenAPI.HEADERS || {};
}

/**
 * Get all characters for the authenticated user
 * Retrieves the complete list of characters owned by the authenticated user.
 * The X-User-Id header is automatically attached via OpenAPI configuration.
 *
 * @returns Promise<ListCharactersResponse> - List of character metadata with count
 * @throws Error - If X-User-Id is not configured
 * @throws ApiError - On authentication failure (401) or other API errors
 *
 * @example
 * ```ts
 * const response = await getUserCharacters();
 * console.log(`Found ${response.count} characters`);
 * response.characters.forEach(char => console.log(char.name));
 * ```
 */
export async function getUserCharacters(): Promise<ListCharactersResponse> {
  const headers = await getOpenApiHeaders();
  const userId = headers['X-User-Id'];
  
  if (!userId) {
    throw new Error('X-User-Id header is required but not configured');
  }

  return CharactersService.listCharactersCharactersGet({
    xUserId: userId
  });
}

/**
 * Get the most recent narrative turn for a character
 * Retrieves the last narrative turn (n=1) for the specified character.
 * The X-User-Id header is automatically attached for access control when configured.
 *
 * @param characterId - UUID of the character (must be non-empty)
 * @returns Promise<GetNarrativeResponse> - Response with turns array and metadata
 * @throws Error - If characterId is empty or undefined
 * @throws ApiError - On authentication failure (401/403), not found (404), or other API errors
 *
 * @example
 * ```ts
 * const response = await getCharacterLastTurn('char-uuid-123');
 * if (response.turns.length > 0) {
 *   const lastTurn = response.turns[0];
 *   console.log(`Last turn: ${lastTurn.narrative}`);
 * }
 * ```
 */
export async function getCharacterLastTurn(characterId: string): Promise<GetNarrativeResponse> {
  if (!characterId || characterId.trim() === '') {
    throw new Error('characterId is required and must be non-empty');
  }

  const headers = await getOpenApiHeaders();
  const userId = headers['X-User-Id'] || null;

  return CharactersService.getNarrativeTurnsCharactersCharacterIdNarrativeGet({
    characterId,
    n: 1,
    xUserId: userId
  });
}
