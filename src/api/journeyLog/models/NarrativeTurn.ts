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
 * A single narrative turn in the character's story.
 *
 * Represents one interaction between the player and the game master (AI),
 * including the player's action, AI's response, and timestamp.
 *
 * Field size limits:
 * - user_action: max 8000 characters
 * - ai_response: max 32000 characters
 *
 * Referenced in: docs/SCHEMA.md - Narrative Turns Subcollection
 */
export type NarrativeTurn = {
    /**
     * Unique turn identifier (UUIDv4)
     */
    turn_id: string;
    /**
     * Sequential turn counter
     */
    turn_number?: (number | null);
    /**
     * Player's action or input (max 8000 characters)
     */
    player_action: string;
    /**
     * Game master's/AI's response (max 32000 characters)
     */
    gm_response: string;
    /**
     * When the turn occurred (datetime object or ISO 8601 string)
     */
    timestamp: string;
    /**
     * Snapshot of relevant game state at this turn
     */
    game_state_snapshot?: (Record<string, any> | null);
    /**
     * Additional turn metadata (response time, LLM model, etc.)
     */
    metadata?: (Record<string, any> | null);
};

