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
 * Descriptor for an enemy in combat.
 *
 * Used by CombatIntent to describe enemies encountered in combat.
 *
 * Attributes:
 * name: Optional name of the enemy (e.g., "Goblin Scout")
 * description: Optional description of the enemy's appearance or behavior
 * threat: Optional threat level or classification (e.g., "low", "medium", "high")
 */
export type EnemyDescriptor = {
    /**
     * Name of the enemy
     */
    name?: (string | null);
    /**
     * Description of the enemy's appearance or behavior
     */
    description?: (string | null);
    /**
     * Threat level or classification
     */
    threat?: (string | null);
};

