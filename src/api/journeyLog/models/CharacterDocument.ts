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
import type { CombatState_Output } from './CombatState_Output';
import type { PlayerState } from './PlayerState';
import type { PointOfInterest } from './PointOfInterest';
import type { Quest } from './Quest';
import type { QuestArchiveEntry } from './QuestArchiveEntry';
/**
 * Character document schema as defined in docs/SCHEMA.md
 */
export type CharacterDocument = {
    /**
     * UUIDv4 character identifier (matches Firestore document ID)
     */
    character_id: string;
    /**
     * User ID of the character owner (for access control, from X-User-Id header)
     */
    owner_user_id: string;
    /**
     * Initial adventure prompt or backstory (non-empty, whitespace normalized)
     */
    adventure_prompt: string;
    /**
     * Current player character state
     */
    player_state: PlayerState;
    /**
     * Reference to world POI collection or configuration
     */
    world_pois_reference: string;
    /**
     * Reference to narrative turns subcollection or storage location
     */
    narrative_turns_reference: string;
    /**
     * Schema version for this document (semantic versioning format, e.g., '1.0.0')
     */
    schema_version: string;
    /**
     * When the character was created (Firestore Timestamp or ISO 8601)
     */
    created_at: string;
    /**
     * Last update timestamp (Firestore Timestamp or ISO 8601)
     */
    updated_at: string;
    /**
     * Total number of narrative turns taken by this character (incremented on each narrative turn)
     */
    current_turn?: number;
    /**
     * Number of turns since the last quest was set (resets to 0 when a new quest is set, increments only when no active quest)
     */
    turns_since_last_quest?: number;
    /**
     * Number of turns since the last POI was discovered (resets to 0 when a new POI is created, increments only when not at a POI)
     */
    turns_since_last_poi?: number;
    /**
     * Optional world state metadata or game-specific data
     */
    world_state?: (Record<string, any> | null);
    /**
     * DEPRECATED: Read-only compatibility field for legacy embedded POIs. The authoritative POI storage is the subcollection at characters/{character_id}/pois/{poi_id}. This field is maintained for backward compatibility during migration. New POI writes go to the subcollection only. Max 200 entries.
     */
    world_pois?: Array<PointOfInterest>;
    /**
     * Current active quest (None if no active quest)
     */
    active_quest?: (Quest | null);
    /**
     * Archived/completed quests (max 50 entries, oldest removed when exceeded)
     */
    archived_quests?: Array<QuestArchiveEntry>;
    /**
     * Current combat state (None if not in combat)
     */
    combat_state?: (CombatState_Output | null);
    /**
     * Extensible metadata including character name, timestamps, owner info, etc.
     */
    additional_metadata?: Record<string, any>;
};

