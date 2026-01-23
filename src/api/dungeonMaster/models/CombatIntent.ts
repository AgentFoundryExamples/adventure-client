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
import type { EnemyDescriptor } from './EnemyDescriptor';
/**
 * Combat-related intent from LLM output.
 *
 * Indicates what combat action the narrative implies, if any.
 * The LLM only suggests intents; the service decides actual combat operations.
 *
 * Attributes:
 * action: Combat action type - "none", "start", "continue", or "end"
 * enemies: Optional list of enemy descriptors
 * combat_notes: Optional notes about the combat situation
 */
export type CombatIntent = {
    /**
     * Combat action to perform
     */
    action?: 'none' | 'start' | 'continue' | 'end';
    /**
     * List of enemies in the encounter
     */
    enemies?: (Array<EnemyDescriptor> | null);
    /**
     * Additional notes about the combat situation
     */
    combat_notes?: (string | null);
};

