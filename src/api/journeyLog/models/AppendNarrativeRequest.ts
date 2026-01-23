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
/**
 * Request model for appending a narrative turn to a character.
 *
 * Required fields:
 * - user_action: Player's action or input (1-8000 characters)
 * - ai_response: Game master's/AI's response (1-32000 characters)
 *
 * Optional fields:
 * - timestamp: When the turn occurred (ISO 8601 string). Defaults to server UTC now if omitted.
 *
 * Validation:
 * - user_action: max 8000 characters
 * - ai_response: max 32000 characters
 * - Combined length: max 40000 characters
 */
export type AppendNarrativeRequest = {
    /**
     * Player's action or input (max 8000 characters)
     */
    user_action: string;
    /**
     * Game master's/AI's response (max 32000 characters)
     */
    ai_response: string;
    /**
     * Optional ISO 8601 timestamp. Defaults to server UTC now if omitted.
     */
    timestamp?: (string | null);
};

