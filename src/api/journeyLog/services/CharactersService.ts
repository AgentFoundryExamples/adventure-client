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
import type { AppendNarrativeRequest } from '../models/AppendNarrativeRequest';
import type { AppendNarrativeResponse } from '../models/AppendNarrativeResponse';
import type { CharacterContextResponse } from '../models/CharacterContextResponse';
import type { CreateCharacterRequest } from '../models/CreateCharacterRequest';
import type { CreateCharacterResponse } from '../models/CreateCharacterResponse';
import type { CreatePOIRequest } from '../models/CreatePOIRequest';
import type { CreatePOIResponse } from '../models/CreatePOIResponse';
import type { GetCharacterResponse } from '../models/GetCharacterResponse';
import type { GetCombatResponse } from '../models/GetCombatResponse';
import type { GetNarrativeResponse } from '../models/GetNarrativeResponse';
import type { GetPOIsResponse } from '../models/GetPOIsResponse';
import type { GetPOISummaryResponse } from '../models/GetPOISummaryResponse';
import type { GetQuestResponse } from '../models/GetQuestResponse';
import type { GetRandomPOIsResponse } from '../models/GetRandomPOIsResponse';
import type { ListCharactersResponse } from '../models/ListCharactersResponse';
import type { Quest } from '../models/Quest';
import type { SetQuestResponse } from '../models/SetQuestResponse';
import type { UpdateCombatRequest } from '../models/UpdateCombatRequest';
import type { UpdateCombatResponse } from '../models/UpdateCombatResponse';
import type { UpdatePOIRequest } from '../models/UpdatePOIRequest';
import type { UpdatePOIResponse } from '../models/UpdatePOIResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CharactersService {
    /**
     * List all characters for a user
     * Retrieve all character saves for a user_id to drive save-slot UIs.
     *
     * **Required Headers:**
     * - `X-User-Id`: User identifier (for ownership and access control)
     *
     * **Optional Query Parameters:**
     * - `limit`: Maximum number of characters to return (default: unlimited)
     * - `offset`: Number of characters to skip for pagination (default: 0)
     *
     * **Response:**
     * - Returns an array of character metadata objects
     * - Each object contains: character_id, name, race, class, status, created_at, updated_at
     * - Results are sorted by updated_at descending (most recently updated first)
     * - Empty list returned if user has no characters
     *
     * **Error Responses:**
     * - `400`: Missing or empty X-User-Id header
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns ListCharactersResponse Successful Response
     * @throws ApiError
     */
    public static listCharactersCharactersGet({
        xUserId,
        limit,
        offset,
    }: {
        /**
         * User identifier for ownership
         */
        xUserId: string,
        limit?: (number | null),
        offset?: number,
    }): CancelablePromise<ListCharactersResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/characters',
            headers: {
                'x-user-id': xUserId,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create a new character
     * Initialize a new character with defaults and persist to Firestore.
     *
     * **Required Headers:**
     * - `X-User-Id`: User identifier (for ownership and access control)
     *
     * **Default Values Applied:**
     * - `status`: Healthy
     * - `equipment`: Empty list (no weapons)
     * - `inventory`: Empty list (no items)
     * - `location`: origin:nexus/The Nexus (unless overridden)
     * - `world_state`: null
     * - `active_quest`: null
     * - `combat_state`: null
     * - `schema_version`: 1.0.0
     * - `created_at`, `updated_at`: Current server timestamp
     *
     * **Uniqueness Constraint:**
     * The combination of (user_id, name, race, class) must be unique. Attempting to create a duplicate will return 409 Conflict.
     *
     * **Error Responses:**
     * - `400`: Missing or invalid X-User-Id header
     * - `409`: Duplicate character (user_id, name, race, class) already exists
     * - `422`: Validation error (missing required fields or invalid values)
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns CreateCharacterResponse Successful Response
     * @throws ApiError
     */
    public static createCharacterCharactersPost({
        xUserId,
        requestBody,
    }: {
        /**
         * User identifier for ownership
         */
        xUserId: string,
        requestBody: CreateCharacterRequest,
    }): CancelablePromise<CreateCharacterResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/characters',
            headers: {
                'x-user-id': xUserId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get a character by ID
     * Retrieve a complete character document by its character_id.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Optional Headers:**
     * - `X-User-Id`: User identifier (if provided, must match the character's owner_user_id)
     * - If header is provided but empty/whitespace-only, returns 400 error
     * - If omitted entirely, allows anonymous access without verification
     *
     * **Response:**
     * - Returns the complete CharacterDocument with all fields
     * - Includes player state, quests, combat state, and metadata
     * - Timestamps are returned as ISO 8601 strings
     *
     * **Error Responses:**
     * - `400`: X-User-Id header provided but empty/whitespace-only
     * - `404`: Character not found
     * - `403`: X-User-Id header provided but does not match character owner
     * - `422`: Invalid UUID format for character_id
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns GetCharacterResponse Successful Response
     * @throws ApiError
     */
    public static getCharacterCharactersCharacterIdGet({
        characterId,
        xUserId,
    }: {
        characterId: string,
        /**
         * User identifier for access control
         */
        xUserId?: (string | null),
    }): CancelablePromise<GetCharacterResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/characters/{character_id}',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Append a narrative turn to a character
     * Append a validated narrative turn with concurrency safety.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Required Headers:**
     * - `X-User-Id`: User identifier (must match character owner for access control)
     *
     * **Request Body:**
     * - `user_action`: Player's action (1-8000 characters)
     * - `ai_response`: AI/GM response (1-32000 characters)
     * - `timestamp`: Optional ISO 8601 timestamp (defaults to server UTC now)
     *
     * **Validation:**
     * - user_action: max 8000 characters
     * - ai_response: max 32000 characters
     * - Combined length: max 40000 characters
     * - Timestamp format: ISO 8601 (if provided)
     *
     * **Atomicity:**
     * Uses Firestore transaction to atomically:
     * 1. Add document to characters/{character_id}/narrative_turns subcollection
     * 2. Update parent character.updated_at timestamp
     *
     * **Response:**
     * - Returns the stored NarrativeTurn (with server-generated timestamp if not provided)
     * - Includes total_turns count for confirmation
     *
     * **Error Responses:**
     * - `400`: Missing or invalid X-User-Id header
     * - `403`: X-User-Id does not match character owner
     * - `404`: Character not found
     * - `413`: Request entity too large (combined payload > 40000 characters)
     * - `422`: Validation error (invalid field values, oversized fields, invalid timestamp format)
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns AppendNarrativeResponse Successful Response
     * @throws ApiError
     */
    public static appendNarrativeTurnCharactersCharacterIdNarrativePost({
        characterId,
        xUserId,
        requestBody,
    }: {
        characterId: string,
        /**
         * User identifier for ownership
         */
        xUserId: string,
        requestBody: AppendNarrativeRequest,
    }): CancelablePromise<AppendNarrativeResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/characters/{character_id}/narrative',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get narrative turns for a character
     * Retrieve the last N narrative turns for a character ordered oldest-to-newest.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Optional Headers:**
     * - `X-User-Id`: User identifier (if provided, must match the character's owner_user_id)
     * - If header is provided but empty/whitespace-only, returns 400 error
     * - If omitted entirely, allows anonymous access without verification
     *
     * **Optional Query Parameters:**
     * - `n`: Number of turns to retrieve (default: 10, min: 1, max: 100)
     * - `since`: ISO 8601 timestamp to filter turns strictly after this time (exclusive, timestamp > since)
     *
     * **Response:**
     * - Returns list of NarrativeTurn objects ordered oldest-to-newest
     * - Includes metadata with requested_n, returned_count, and total_available
     * - Empty list returned if character has no narrative turns
     *
     * **Ordering:**
     * - Results are always returned in chronological order (oldest first)
     * - This ensures LLM context is built in the correct sequence
     *
     * **Error Responses:**
     * - `400`: Invalid query parameters (n out of range, invalid since timestamp) or empty X-User-Id
     * - `403`: X-User-Id provided but does not match character owner
     * - `404`: Character not found
     * - `422`: Invalid UUID format for character_id
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns GetNarrativeResponse Successful Response
     * @throws ApiError
     */
    public static getNarrativeTurnsCharactersCharacterIdNarrativeGet({
        characterId,
        n = 10,
        since,
        xUserId,
    }: {
        characterId: string,
        n?: number,
        since?: (string | null),
        /**
         * User identifier for access control
         */
        xUserId?: (string | null),
    }): CancelablePromise<GetNarrativeResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/characters/{character_id}/narrative',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            query: {
                'n': n,
                'since': since,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add a POI to a character
     * Create a new Point of Interest in a character's pois subcollection.
     *
     * **Authoritative Storage:** POIs are stored in `characters/{character_id}/pois/{poi_id}` subcollection.
     *
     * **Copy-on-Write Migration:** On first POI write, embedded POIs (if any) are automatically migrated to the subcollection.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Required Headers:**
     * - `X-User-Id`: User identifier (must match character owner for access control)
     *
     * **Request Body:**
     * - `name`: POI name (1-200 characters)
     * - `description`: POI description (1-2000 characters)
     * - `timestamp`: Optional ISO 8601 timestamp (defaults to server UTC now)
     * - `tags`: Optional list of tags (max 20 tags, each max 50 characters)
     *
     * **Validation:**
     * - name: required, 1-200 characters
     * - description: required, 1-2000 characters
     * - tags: max 20 entries, each max 50 characters
     * - Duplicate POI names are allowed (each has unique id)
     *
     * **Atomicity:**
     * Uses Firestore transaction to atomically:
     * 1. Verify character exists and user owns it
     * 2. Migrate embedded POIs to subcollection (if migration enabled and needed)
     * 3. Create POI in subcollection with generated id and timestamp
     * 4. Update character.updated_at timestamp
     *
     * **Response:**
     * - Returns the stored PointOfInterest (with server-generated id and created_at)
     *
     * **Error Responses:**
     * - `400`: Missing or invalid X-User-Id header, POI capacity exceeded (200 max)
     * - `403`: X-User-Id does not match character owner
     * - `404`: Character not found
     * - `422`: Validation error (invalid field values, oversized fields)
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns CreatePOIResponse Successful Response
     * @throws ApiError
     */
    public static createPoiCharactersCharacterIdPoisPost({
        characterId,
        xUserId,
        requestBody,
    }: {
        characterId: string,
        /**
         * User identifier for ownership
         */
        xUserId: string,
        requestBody: CreatePOIRequest,
    }): CancelablePromise<CreatePOIResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/characters/{character_id}/pois',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get POIs for a character with cursor-based pagination
     * Retrieve POIs from the character's pois subcollection with cursor-based pagination.
     *
     * **Authoritative Storage:** Reads from `characters/{character_id}/pois/{poi_id}` subcollection.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Optional Headers:**
     * - `X-User-Id`: User identifier (if provided, must match the character's owner_user_id)
     * - If header is provided but empty/whitespace-only, returns 400 error
     * - If omitted entirely, allows anonymous access without verification
     *
     * **Optional Query Parameters:**
     * - `limit`: Maximum number of POIs to return per page (default: 10, max: 100)
     * - `cursor`: Pagination cursor (opaque string from previous response, None for first page)
     *
     * **Cursor-Based Pagination:**
     * - Results are sorted by timestamp_discovered descending (newest first)
     * - Use `limit` to control page size
     * - Use `cursor` from previous response's `cursor` field to get next page
     * - When no more results, response includes cursor=null
     * - Cursors are opaque strings; do not attempt to parse or construct them
     * - Malformed cursors return 400 with guidance to restart pagination
     *
     * **Response:**
     * - Returns list of POIs with pagination metadata
     * - Empty list returned if character has no POIs
     * - cursor field: opaque string for next page or null if exhausted
     *
     * **Error Responses:**
     * - `400`: Invalid query parameters (limit out of range, malformed cursor) or empty X-User-Id
     * - `403`: X-User-Id provided but does not match character owner
     * - `404`: Character not found
     * - `422`: Invalid UUID format for character_id
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns GetPOIsResponse Successful Response
     * @throws ApiError
     */
    public static getPoisCharactersCharacterIdPoisGet({
        characterId,
        limit = 10,
        cursor,
        xUserId,
    }: {
        characterId: string,
        limit?: number,
        cursor?: (string | null),
        /**
         * User identifier for access control
         */
        xUserId?: (string | null),
    }): CancelablePromise<GetPOIsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/characters/{character_id}/pois',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            query: {
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Leave current POI
     * Mark the character as leaving their current Point of Interest.
     *
     * This endpoint sets player_state.at_poi=False and clears player_state.current_poi_id, while preserving the location field for tracking minor/precise positions.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Required Headers:**
     * - `X-User-Id`: User identifier (must match character owner for access control)
     *
     * **Behavior:**
     * - Sets player_state.at_poi = False
     * - Sets player_state.current_poi_id = None
     * - Preserves player_state.location field for minor location tracking
     * - Idempotent: succeeds even if not currently at a POI (returns 204)
     *
     * **Atomicity:**
     * Uses Firestore transaction to atomically:
     * 1. Verify character exists and user owns it
     * 2. Update player_state.at_poi and player_state.current_poi_id
     * 3. Update character.updated_at timestamp
     *
     * **Response:**
     * - Returns 204 No Content on success
     *
     * **Error Responses:**
     * - `400`: Missing or invalid X-User-Id header
     * - `403`: X-User-Id does not match character owner
     * - `404`: Character not found
     * - `422`: Invalid UUID format for character_id
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns void
     * @throws ApiError
     */
    public static leavePoiCharactersCharacterIdPoiDelete({
        characterId,
        xUserId,
    }: {
        characterId: string,
        /**
         * User identifier for ownership
         */
        xUserId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/characters/{character_id}/poi',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get random POIs for a character
     * Retrieve N randomly sampled POIs from a character's pois subcollection.
     *
     * **Authoritative Storage:** Reads from `characters/{character_id}/pois/{poi_id}` subcollection.
     * **Backward Compatibility:** Falls back to embedded world_pois array if subcollection is empty (configurable via POI_EMBEDDED_READ_FALLBACK).
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Optional Headers:**
     * - `X-User-Id`: User identifier (if provided, must match the character's owner_user_id)
     * - If header is provided but empty/whitespace-only, returns 400 error
     * - If omitted entirely, allows anonymous access without verification
     *
     * **Optional Query Parameters:**
     * - `n`: Number of POIs to sample (default: 3, min: 1, max: 20)
     *
     * **Sampling Behavior:**
     * - POIs are sampled uniformly at random without replacement
     * - If fewer than N POIs exist, returns all available POIs
     * - If no POIs exist, returns empty list (not an error)
     * - Same request may return different POIs on each call (non-deterministic)
     *
     * **Response:**
     * - Returns list of randomly sampled POIs
     * - Includes metadata: count, requested_n, total_available
     *
     * **Error Responses:**
     * - `400`: Invalid query parameters (n <= 0 or n > 20) or empty X-User-Id
     * - `403`: X-User-Id provided but does not match character owner
     * - `404`: Character not found
     * - `422`: Invalid UUID format for character_id
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns GetRandomPOIsResponse Successful Response
     * @throws ApiError
     */
    public static getRandomPoisCharactersCharacterIdPoisRandomGet({
        characterId,
        n = 3,
        xUserId,
    }: {
        characterId: string,
        n?: number,
        /**
         * User identifier for access control
         */
        xUserId?: (string | null),
    }): CancelablePromise<GetRandomPOIsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/characters/{character_id}/pois/random',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            query: {
                'n': n,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get POI count and preview for a character
     * Retrieve a lightweight POI summary with total count and capped preview.
     *
     * **Authoritative Storage:** Reads from `characters/{character_id}/pois/{poi_id}` subcollection.
     *
     * **Use Case:** This endpoint provides aggregate POI information for UI previews
     * without scanning large collections or loading all POIs into memory.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Optional Headers:**
     * - `X-User-Id`: User identifier (if provided, must match the character's owner_user_id)
     * - If header is provided but empty/whitespace-only, returns 400 error
     * - If omitted entirely, allows anonymous access without verification
     *
     * **Optional Query Parameters:**
     * - `preview_limit`: Maximum number of POIs to include in preview (default: 5, max: 20)
     *
     * **Response:**
     * - `total_count`: Total number of POIs using efficient count aggregation
     * - `preview`: Up to preview_limit POIs sorted by newest first
     * - `preview_count`: Number of POIs in the preview
     *
     * **Performance:**
     * - Uses Firestore count() aggregation (single read cost)
     * - Preview query limited to prevent large dataset scans
     * - Total latency typically <50ms even for large POI collections
     *
     * **Error Responses:**
     * - `400`: Invalid query parameters (preview_limit out of range) or empty X-User-Id
     * - `403`: X-User-Id provided but does not match character owner
     * - `404`: Character not found
     * - `422`: Invalid UUID format for character_id
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns GetPOISummaryResponse Successful Response
     * @throws ApiError
     */
    public static getPoiSummaryCharactersCharacterIdPoisSummaryGet({
        characterId,
        previewLimit = 5,
        xUserId,
    }: {
        characterId: string,
        previewLimit?: number,
        /**
         * User identifier for access control
         */
        xUserId?: (string | null),
    }): CancelablePromise<GetPOISummaryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/characters/{character_id}/pois/summary',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            query: {
                'preview_limit': previewLimit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update an existing POI
     * Update fields of an existing POI in the character's pois subcollection.
     *
     * **Authoritative Storage:** Updates POI in `characters/{character_id}/pois/{poi_id}` subcollection.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     * - `poi_id`: UUID-formatted POI identifier
     *
     * **Required Headers:**
     * - `X-User-Id`: User identifier (must match character owner for access control)
     *
     * **Request Body:**
     * - At least one field must be provided for update
     * - `name`: Optional POI name (1-200 characters)
     * - `description`: Optional POI description (1-2000 characters)
     * - `visited`: Optional visited flag (boolean)
     * - `tags`: Optional list of tags (max 20 tags, each max 50 characters)
     *
     * **Partial Updates:**
     * - Only provided fields are updated
     * - Null/missing fields are not changed
     * - To clear tags, provide an empty list []
     *
     * **Response:**
     * - Returns the updated POI with all fields (including unchanged ones)
     *
     * **Error Responses:**
     * - `400`: Missing or invalid X-User-Id header, no fields provided
     * - `403`: X-User-Id does not match character owner
     * - `404`: Character or POI not found
     * - `422`: Validation error (invalid field values)
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns UpdatePOIResponse Successful Response
     * @throws ApiError
     */
    public static updatePoiCharactersCharacterIdPoisPoiIdPut({
        characterId,
        poiId,
        xUserId,
        requestBody,
    }: {
        characterId: string,
        poiId: string,
        /**
         * User identifier for ownership
         */
        xUserId: string,
        requestBody: UpdatePOIRequest,
    }): CancelablePromise<UpdatePOIResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/characters/{character_id}/pois/{poi_id}',
            path: {
                'character_id': characterId,
                'poi_id': poiId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete a POI
     * Delete a POI from the character's pois subcollection.
     *
     * **Authoritative Storage:** Deletes POI from `characters/{character_id}/pois/{poi_id}` subcollection.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     * - `poi_id`: UUID-formatted POI identifier
     *
     * **Required Headers:**
     * - `X-User-Id`: User identifier (must match character owner for access control)
     *
     * **Behavior:**
     * - Permanently deletes the POI from subcollection
     * - Idempotent: succeeds even if POI doesn't exist (returns 204)
     * - Updates character.updated_at timestamp
     *
     * **Response:**
     * - Returns 204 No Content on success (even if POI didn't exist)
     *
     * **Error Responses:**
     * - `400`: Missing or invalid X-User-Id header
     * - `403`: X-User-Id does not match character owner
     * - `404`: Character not found
     * - `422`: Invalid UUID format for character_id or poi_id
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns void
     * @throws ApiError
     */
    public static deletePoiCharactersCharacterIdPoisPoiIdDelete({
        characterId,
        poiId,
        xUserId,
    }: {
        characterId: string,
        poiId: string,
        /**
         * User identifier for ownership
         */
        xUserId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/characters/{character_id}/pois/{poi_id}',
            path: {
                'character_id': characterId,
                'poi_id': poiId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Set active quest for a character
     * Set or update the active quest for a character.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Required Headers:**
     * - `X-User-Id`: User identifier (must match character owner for access control)
     *
     * **Request Body:**
     * - Quest object with name, description, requirements, rewards, completion_state, updated_at
     *
     * **Validation:**
     * - name: required string
     * - description: required string
     * - requirements: list of strings (default: [])
     * - rewards: QuestRewards object with items, currency, experience
     * - completion_state: 'not_started', 'in_progress', or 'completed'
     * - updated_at: ISO 8601 timestamp
     *
     * **Single Quest Constraint:**
     * Only one active quest is allowed per character. If an active quest already exists,
     * this endpoint returns 409 Conflict with guidance to DELETE the existing quest first.
     *
     * **Atomicity:**
     * Uses Firestore transaction to atomically:
     * 1. Verify character exists and user owns it
     * 2. Check that no active quest exists
     * 3. Set active_quest field
     * 4. Update character.updated_at timestamp
     *
     * **Response:**
     * - Returns the stored Quest object
     *
     * **Error Responses:**
     * - `400`: Missing or invalid X-User-Id header
     * - `403`: X-User-Id does not match character owner
     * - `404`: Character not found
     * - `409`: Active quest already exists (DELETE required before replacing)
     * - `422`: Validation error (invalid field values, invalid completion_state)
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns SetQuestResponse Successful Response
     * @throws ApiError
     */
    public static setQuestCharactersCharacterIdQuestPut({
        characterId,
        xUserId,
        requestBody,
    }: {
        characterId: string,
        /**
         * User identifier for ownership
         */
        xUserId: string,
        requestBody: Quest,
    }): CancelablePromise<SetQuestResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/characters/{character_id}/quest',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get active quest for a character
     * Retrieve the active quest for a character.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Optional Headers:**
     * - `X-User-Id`: User identifier (if provided, must match the character's owner_user_id)
     * - If header is provided but empty/whitespace-only, returns 400 error
     * - If omitted entirely, allows anonymous access without verification
     *
     * **Response:**
     * - Returns the Quest object if an active quest exists
     * - Returns {"quest": null} if no active quest exists
     *
     * **Error Responses:**
     * - `400`: X-User-Id header provided but empty/whitespace-only
     * - `403`: X-User-Id provided but does not match character owner
     * - `404`: Character not found
     * - `422`: Invalid UUID format for character_id
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns GetQuestResponse Successful Response
     * @throws ApiError
     */
    public static getQuestCharactersCharacterIdQuestGet({
        characterId,
        xUserId,
    }: {
        characterId: string,
        /**
         * User identifier for access control
         */
        xUserId?: (string | null),
    }): CancelablePromise<GetQuestResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/characters/{character_id}/quest',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete active quest for a character
     * Clear the active quest for a character and archive it.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Required Headers:**
     * - `X-User-Id`: User identifier (must match character owner for access control)
     *
     * **Behavior:**
     * - Removes active_quest field from character
     * - Appends quest to archived_quests with cleared_at timestamp
     * - Enforces 50-entry limit on archived_quests (oldest entries removed first)
     * - Idempotent: succeeds even if no active quest exists (returns 204)
     *
     * **Atomicity:**
     * Uses Firestore transaction to atomically:
     * 1. Verify character exists and user owns it
     * 2. Remove active quest (if exists)
     * 3. Archive quest to archived_quests with cleared_at timestamp
     * 4. Trim archived_quests to maintain ≤50 entries (oldest first)
     * 5. Update character.updated_at timestamp
     *
     * **Response:**
     * - Returns 204 No Content on success
     *
     * **Error Responses:**
     * - `400`: Missing or invalid X-User-Id header
     * - `403`: X-User-Id does not match character owner
     * - `404`: Character not found
     * - `422`: Invalid UUID format for character_id
     * - `500`: Internal server error (e.g., Firestore transient errors)
     * @returns void
     * @throws ApiError
     */
    public static deleteQuestCharactersCharacterIdQuestDelete({
        characterId,
        xUserId,
    }: {
        characterId: string,
        /**
         * User identifier for ownership
         */
        xUserId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/characters/{character_id}/quest',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update combat state for a character
     * Set or clear the combat state for a character with full state replacement.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Required Headers:**
     * - `X-User-Id`: User identifier (must match character owner for access control)
     *
     * **Request Body:**
     * - `combat_state`: Full CombatState object or null to clear combat
     *
     * **CombatState Validation:**
     * - Maximum 5 enemies per combat (422 error if exceeded)
     * - All enemy statuses must be valid enum values (Healthy, Wounded, Dead)
     * - All required fields must be present (combat_id, started_at, enemies)
     * - Empty enemies list is allowed and sets active=false
     *
     * **Server-Side is_active Computation:**
     * - active=true when any enemy has status != Dead
     * - active=false when all enemies are Dead or enemies list is empty
     * - active=false when combat_state is null
     *
     * **Atomicity:**
     * Uses Firestore transaction to atomically:
     * 1. Verify character exists and user owns it
     * 2. Update combat_state field (or clear to null)
     * 3. Update character.updated_at timestamp
     * 4. Log when combat transitions from active to inactive
     *
     * **Response:**
     * - Returns {"active": bool, "state": CombatState | null}
     * - HTTP 200 for successful updates (both set and clear operations)
     *
     * **Error Responses:**
     * - `400`: Missing or invalid X-User-Id header
     * - `403`: X-User-Id does not match character owner
     * - `404`: Character not found
     * - `422`: Validation error (>5 enemies, invalid status, missing required fields)
     * - `500`: Internal server error (e.g., Firestore transient errors)
     *
     * **Edge Cases:**
     * - Submitting >5 enemies returns 422 with detailed error
     * - Submitting null clears combat and returns {"active": false, "state": null}
     * - All enemies Dead returns {"active": false, "state": <combat_state>}
     * - Race conditions: last writer wins without corrupting other fields
     * - Unknown status strings cause explicit validation errors
     * @returns UpdateCombatResponse Successful Response
     * @throws ApiError
     */
    public static updateCombatCharactersCharacterIdCombatPut({
        characterId,
        xUserId,
        requestBody,
    }: {
        characterId: string,
        /**
         * User identifier for ownership
         */
        xUserId: string,
        requestBody: UpdateCombatRequest,
    }): CancelablePromise<UpdateCombatResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/characters/{character_id}/combat',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get combat state for a character
     * Retrieve the current combat state for a character with a predictable JSON envelope.
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Optional Headers:**
     * - `X-User-Id`: User identifier (if provided, must match the character's owner_user_id)
     * - If header is provided but empty/whitespace-only, returns 400 error
     * - If omitted entirely, allows anonymous access without verification
     *
     * **Response:**
     * - Always returns HTTP 200 with JSON object: {"active": bool, "state": CombatState | null}
     * - `active=true, state=<CombatState>` when any enemy has status != Dead
     * - `active=false, state=null` when combat_state is absent, empty, or all enemies are Dead
     * - Never returns 204 No Content - always provides the active/state envelope
     *
     * **Combat Inactivity Detection:**
     * Combat is considered inactive when:
     * - combat_state field is None/missing in the character document
     * - enemies list is empty
     * - all enemies have status == Dead
     *
     * **Response Consistency:**
     * - Uses the same CombatState serialization as PUT responses
     * - Respects the ≤5 enemies constraint (defensive filtering on read)
     * - All fields (is_active, traits, weapons) stay consistent with PUT responses
     *
     * **Error Responses:**
     * - `400`: X-User-Id header provided but empty/whitespace-only
     * - `403`: X-User-Id provided but does not match character owner
     * - `404`: Character not found (NOT returned for 'no combat active' case)
     * - `422`: Invalid UUID format for character_id
     * - `500`: Internal server error (e.g., Firestore transient errors)
     *
     * **Edge Cases:**
     * - Stored documents with >5 enemies (legacy data) trigger defensive filtering
     * - Race conditions where combat cleared between read start/finish return inactive
     * - Malformed stored data is handled gracefully with fallback to inactive
     * - Characters with no combat history return {"active": false, "state": null}
     * @returns GetCombatResponse Successful Response
     * @throws ApiError
     */
    public static getCombatCharactersCharacterIdCombatGet({
        characterId,
        xUserId,
    }: {
        characterId: string,
        /**
         * User identifier for access control
         */
        xUserId?: (string | null),
    }): CancelablePromise<GetCombatResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/characters/{character_id}/combat',
            path: {
                'character_id': characterId,
            },
            headers: {
                'x-user-id': xUserId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get aggregated character context for Director/LLM integration
     * Retrieve a comprehensive context payload for AI-driven narrative generation.
     *
     * This endpoint aggregates:
     * - Player state (identity, status, level, equipment, location)
     * - Active quest with derived has_active_quest flag (optional via include_quest)
     * - Combat state with derived active flag (optional via include_combat)
     * - Recent narrative turns (configurable window, ordered oldest-to-newest, optional via include_narrative)
     * - Optional world POIs sample (can be suppressed via include_pois flag)
     *
     * **Path Parameters:**
     * - `character_id`: UUID-formatted character identifier
     *
     * **Optional Headers:**
     * - `X-User-Id`: User identifier for access control
     * - If provided but empty/whitespace-only, returns 400 error
     * - If omitted entirely, allows anonymous access without verification
     * - If provided, must match the character's owner_user_id
     *
     * **Optional Query Parameters:**
     * - `recent_n` (integer): Number of recent narrative turns to include (default: 20, min: 1, max: configured limit)
     * - `include_pois` (boolean): Whether to include POI sample in world state (default: false)
     * - `include_narrative` (boolean): Whether to include narrative turns (default: true)
     * - `include_combat` (boolean): Whether to include combat state (default: true)
     * - `include_quest` (boolean): Whether to include quest data (default: true)
     *
     * **Component Toggles:**
     * The include_* flags allow selective payload sizing for performance optimization:
     * - When include_narrative=false: narrative.recent_turns returns empty list, Firestore query skipped
     * - When include_combat=false: combat returns {active: false, state: null}
     * - When include_quest=false: quest returns null, has_active_quest=false
     * - Component flags (narrative, combat, quest) default to true; include_pois defaults to false
     * - Response structure remains stable regardless of flag values
     *
     * **Timing Metrics:**
     * Success logs include timing measurements (in milliseconds):
     * - character_doc_fetch_ms: Time to fetch character document
     * - narrative_query_ms: Time to query narrative turns (0 if skipped)
     * - poi_query_ms: Time to query POIs (0 if skipped)
     * All timing fields are included in structured logs with character_id for correlation.
     *
     * **Response Structure:**
     * ```json
     * {
         * "character_id": "uuid",
         * "player_state": { ... },
         * "quest": { ... } or null,
         * "combat": {
             * "active": true/false,
             * "state": { ... } or null
             * },
             * "narrative": {
                 * "recent_turns": [ ... ],
                 * "requested_n": 20,
                 * "returned_n": 15,
                 * "max_n": 100
                 * },
                 * "world": {
                     * "pois_sample": [ ... ],
                     * "include_pois": true
                     * },
                     * "has_active_quest": true/false
                     * }
                     * ```
                     *
                     * **Derived Fields:**
                     * - `has_active_quest`: Computed as `quest is not None`
                     * - `combat.active`: Computed as `any enemy status != Dead`
                     * - `narrative.returned_n`: Actual number of turns returned (may be less than requested_n)
                     * - `narrative.max_n`: Server-configured maximum (informs clients of limits)
                     *
                     * **Performance Notes:**
                     * - Character document: Single Firestore read (embedded state)
                     * - Narrative turns: Subcollection query (indexed by timestamp) - skipped if include_narrative=false
                     * - POI sample: Subcollection query - skipped if include_pois=false
                     * - Total latency typically <100ms for moderate datasets
                     * - Use component toggles to reduce payload size and query time
                     *
                     * **Error Responses:**
                     * - `400 Bad Request`: Invalid query parameters (recent_n out of range) or empty X-User-Id
                     * - `403 Forbidden`: X-User-Id provided but does not match character owner
                     * - `404 Not Found`: Character not found
                     * - `422 Unprocessable Entity`: Invalid UUID format for character_id
                     * - `500 Internal Server Error`: Firestore transient errors
                     *
                     * **Edge Cases:**
                     * - Empty narrative history: Returns empty recent_turns array with returned_n=0
                     * - No active quest: Returns quest=null, has_active_quest=false
                     * - Inactive combat: Returns combat.active=false, combat.state=null
                     * - include_pois=false: Returns world.pois_sample=[], world.include_pois=false
                     * - include_narrative=false: Skips Firestore query, returns empty turns, recent_n still validated
                     * - Multiple include_* flags false: Response remains structurally valid without missing keys
                     * - recent_n exceeds available turns: Returns all available turns without error
                     * @returns CharacterContextResponse Successful Response
                     * @throws ApiError
                     */
                    public static getCharacterContextCharactersCharacterIdContextGet({
                        characterId,
                        recentN = 20,
                        includePois = false,
                        includeNarrative = true,
                        includeCombat = true,
                        includeQuest = true,
                        xUserId,
                    }: {
                        characterId: string,
                        /**
                         * Number of recent narrative turns to include (default: 20, max: 100)
                         */
                        recentN?: number,
                        /**
                         * Whether to include POI sample in world state (default: false)
                         */
                        includePois?: boolean,
                        /**
                         * Whether to include narrative turns in response (default: true)
                         */
                        includeNarrative?: boolean,
                        /**
                         * Whether to include combat state in response (default: true)
                         */
                        includeCombat?: boolean,
                        /**
                         * Whether to include quest data in response (default: true)
                         */
                        includeQuest?: boolean,
                        /**
                         * User identifier for access control
                         */
                        xUserId?: (string | null),
                    }): CancelablePromise<CharacterContextResponse> {
                        return __request(OpenAPI, {
                            method: 'GET',
                            url: '/characters/{character_id}/context',
                            path: {
                                'character_id': characterId,
                            },
                            headers: {
                                'x-user-id': xUserId,
                            },
                            query: {
                                'recent_n': recentN,
                                'include_pois': includePois,
                                'include_narrative': includeNarrative,
                                'include_combat': includeCombat,
                                'include_quest': includeQuest,
                            },
                            errors: {
                                422: `Validation Error`,
                            },
                        });
                    }
                }
