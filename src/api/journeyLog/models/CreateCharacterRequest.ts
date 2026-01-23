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
 * Request model for creating a new character.
 *
 * Required fields:
 * - name: Character name (1-64 characters)
 * - race: Character race (1-64 characters)
 * - class: Character class (1-64 characters)
 * - adventure_prompt: Initial adventure prompt or backstory (non-empty)
 *
 * Optional fields:
 * - location_id: Override default starting location (default: origin:nexus)
 * - location_display_name: Display name for location override
 */
export type CreateCharacterRequest = {
    /**
     * Character name (1-64 characters)
     */
    name: string;
    /**
     * Character race (1-64 characters)
     */
    race: string;
    /**
     * Character class (1-64 characters)
     */
    class: string;
    /**
     * Initial adventure prompt or backstory
     */
    adventure_prompt: string;
    /**
     * Optional location ID override (default: origin:nexus)
     */
    location_id?: (string | null);
    /**
     * Display name for location override
     */
    location_display_name?: (string | null);
};

