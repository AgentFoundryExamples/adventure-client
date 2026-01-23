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
import type { AdminRecentTurnsResponse } from '../models/AdminRecentTurnsResponse';
import type { AdminTurnDetail } from '../models/AdminTurnDetail';
import type { CharacterCreationRequest } from '../models/CharacterCreationRequest';
import type { CharacterCreationResponse } from '../models/CharacterCreationResponse';
import type { DebugParseRequest } from '../models/DebugParseRequest';
import type { HealthResponse } from '../models/HealthResponse';
import type { PolicyConfigReloadRequest } from '../models/PolicyConfigReloadRequest';
import type { PolicyConfigReloadResponse } from '../models/PolicyConfigReloadResponse';
import type { PolicyConfigResponse } from '../models/PolicyConfigResponse';
import type { TurnRequest } from '../models/TurnRequest';
import type { TurnResponse } from '../models/TurnResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GameService {
    /**
     * Process a player turn
     * Process a player's turn action and generate an AI narrative response. This endpoint will orchestrate calls to journey-log for context retrieval and OpenAI for narrative generation. Currently stubbed.
     * @returns TurnResponse Successful narrative generation
     * @throws ApiError
     */
    public static processTurnTurnPost({
        requestBody,
        xDevUserId,
    }: {
        requestBody: TurnRequest,
        xDevUserId?: (string | null),
    }): CancelablePromise<TurnResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/turn',
            headers: {
                'X-Dev-User-Id': xDevUserId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request (malformed UUID, etc.)`,
                404: `Character not found`,
                422: `Validation Error`,
                429: `Rate limit exceeded`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get turn details for introspection
     * Admin endpoint to inspect specific turn state for debugging. Returns comprehensive turn details including input, context snapshot, policy decisions, LLM output, and journey-log writes. Requires ADMIN_ENDPOINTS_ENABLED=true. Relies on Cloud IAM/service-to-service auth (no custom auth).
     * @returns AdminTurnDetail Turn details retrieved successfully
     * @throws ApiError
     */
    public static getTurnDetailsAdminTurnsTurnIdGet({
        turnId,
    }: {
        turnId: string,
    }): CancelablePromise<AdminTurnDetail> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/turns/{turn_id}',
            path: {
                'turn_id': turnId,
            },
            errors: {
                404: `Turn not found or admin endpoints disabled`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get recent turns for a character
     * Admin endpoint to list recent turns for a specific character. Returns turns in reverse chronological order with comprehensive state. Requires ADMIN_ENDPOINTS_ENABLED=true. Relies on Cloud IAM/service-to-service auth (no custom auth).
     * @returns AdminRecentTurnsResponse Recent turns retrieved successfully
     * @throws ApiError
     */
    public static getCharacterRecentTurnsAdminCharactersCharacterIdRecentTurnsGet({
        characterId,
        limit = 20,
    }: {
        characterId: string,
        limit?: number,
    }): CancelablePromise<AdminRecentTurnsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/characters/{character_id}/recent_turns',
            path: {
                'character_id': characterId,
            },
            query: {
                'limit': limit,
            },
            errors: {
                404: `Admin endpoints disabled`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get current policy configuration
     * Admin endpoint to inspect current policy configuration. Returns quest/POI probabilities and cooldowns. Requires ADMIN_ENDPOINTS_ENABLED=true.
     * @returns PolicyConfigResponse Policy config retrieved successfully
     * @throws ApiError
     */
    public static getPolicyConfigAdminPolicyConfigGet(): CancelablePromise<PolicyConfigResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/policy/config',
            errors: {
                404: `Admin endpoints disabled`,
            },
        });
    }
    /**
     * Reload policy configuration
     * Admin endpoint to manually reload policy configuration from file or provided values. Validates config before applying and rolls back on errors. Requires ADMIN_ENDPOINTS_ENABLED=true.
     * @returns PolicyConfigReloadResponse Policy config reloaded successfully
     * @throws ApiError
     */
    public static reloadPolicyConfigAdminPolicyReloadPost({
        requestBody,
    }: {
        requestBody: PolicyConfigReloadRequest,
    }): CancelablePromise<PolicyConfigReloadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/policy/reload',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid config values`,
                404: `Admin endpoints disabled`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Health check endpoint
     * Check service health status. Optionally pings journey-log service if HEALTH_CHECK_JOURNEY_LOG is enabled. Returns 200 with status='healthy' or 'degraded' based on dependency availability.
     * @returns HealthResponse Service is healthy or degraded
     * @throws ApiError
     */
    public static healthCheckHealthGet(): CancelablePromise<HealthResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
        });
    }
    /**
     * Metrics endpoint
     * Get service metrics including request counts, error rates, and latencies. Only available when ENABLE_METRICS is true. Returns 404 if metrics are disabled.
     * @returns any Metrics collected
     * @throws ApiError
     */
    public static getMetricsMetricsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/metrics',
            errors: {
                404: `Metrics disabled`,
            },
        });
    }
    /**
     * Debug endpoint to test LLM response parsing
     * Test the outcome parser with raw LLM response JSON. Only available when ENABLE_DEBUG_ENDPOINTS is true. This endpoint is intended for local development and debugging only. It validates the response against the DungeonMasterOutcome schema and returns detailed parsing results including any validation errors.
     * @returns any Parse results with validation status
     * @throws ApiError
     */
    public static debugParseLlmDebugParseLlmPost({
        requestBody,
    }: {
        requestBody: DebugParseRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/debug/parse_llm',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Debug endpoints disabled`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create a new character
     * Create a new character and generate an introductory narrative scene.
     * @returns CharacterCreationResponse Successful Response
     * @throws ApiError
     */
    public static createCharacterCharactersPost({
        requestBody,
        xDevUserId,
    }: {
        requestBody: CharacterCreationRequest,
        xDevUserId?: (string | null),
    }): CancelablePromise<CharacterCreationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/characters',
            headers: {
                'X-Dev-User-Id': xDevUserId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
