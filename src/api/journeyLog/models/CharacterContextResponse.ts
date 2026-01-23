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
import type { CombatEnvelope } from './CombatEnvelope';
import type { ContextCapsMetadata } from './ContextCapsMetadata';
import type { NarrativeContext } from './NarrativeContext';
import type { PlayerState } from './PlayerState';
import type { Quest } from './Quest';
import type { WorldContextState } from './WorldContextState';
/**
 * Aggregated character context for Director/LLM integration.
 *
 * This model provides a single JSON payload capturing all relevant character state:
 * - Identity and player state (status, level, equipment, location)
 * - Active quest with derived has_active_quest flag
 * - Combat state with derived active flag
 * - Recent narrative turns with metadata
 * - Optional world POIs sample
 * - Metadata describing caps and read limits
 *
 * This is the primary integration surface for Directors to retrieve character context
 * for AI-driven narrative generation.
 *
 * EXACT SHAPE REQUIREMENT: This model must match the exact structure specified
 * in the issue requirements for the context aggregation endpoint.
 */
export type CharacterContextResponse = {
    /**
     * UUID character identifier
     */
    character_id: string;
    /**
     * Initial adventure prompt or backstory that guides the narrative
     */
    adventure_prompt: string;
    /**
     * Current player character state
     */
    player_state: PlayerState;
    /**
     * Total number of narrative turns taken by this character
     */
    current_turn: number;
    /**
     * Number of turns since the last quest was set (resets to 0 when a new quest is set)
     */
    turns_since_last_quest: number;
    /**
     * Number of turns since the last POI was discovered (resets to 0 when a new POI is created)
     */
    turns_since_last_poi: number;
    /**
     * Active quest or null if no active quest
     */
    quest?: (Quest | null);
    /**
     * Derived flag: true if quest is not null, false otherwise
     */
    has_active_quest: boolean;
    /**
     * Combat state with derived active flag
     */
    combat: CombatEnvelope;
    /**
     * Recent narrative turns with metadata
     */
    narrative: NarrativeContext;
    /**
     * World state including optional POI sample
     */
    world: WorldContextState;
    /**
     * Metadata describing read limits and configured caps
     */
    metadata: ContextCapsMetadata;
};

