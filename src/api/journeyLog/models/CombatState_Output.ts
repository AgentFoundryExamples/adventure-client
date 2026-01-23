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
import type { EnemyState } from './EnemyState';
/**
 * Current combat state with up to 5 enemies.
 *
 * Represents an active combat encounter, including enemies and combat status.
 * When not in combat, the combat_state field in CharacterDocument should be None.
 *
 * Combat is considered inactive when all enemies are Dead or the enemy list is empty.
 * Maximum 5 enemies per combat to prevent document bloat.
 *
 * Referenced in: docs/SCHEMA.md - Character Document Fields (combat_state)
 */
export type CombatState_Output = {
    /**
     * Unique combat identifier
     */
    combat_id: string;
    /**
     * When combat started
     */
    started_at: string;
    /**
     * Current combat turn
     */
    turn?: number;
    /**
     * List of enemies in combat (max 5)
     */
    enemies: Array<EnemyState>;
    /**
     * Player status effects and conditions during combat
     */
    player_conditions?: (Record<string, any> | null);
};

