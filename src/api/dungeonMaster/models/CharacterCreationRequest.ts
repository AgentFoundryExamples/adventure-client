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
 * Attributes:
 * name: Name of the character.
 * race: Race of the character.
 * class_name: Class of the character (e.g., "Warrior", "Mage").
 * custom_prompt: Optional user-provided prompt to shape the world/setting.
 */
export type CharacterCreationRequest = {
    /**
     * Character name
     */
    name: string;
    /**
     * Character race
     */
    race: string;
    /**
     * Character class
     */
    class_name: string;
    /**
     * Optional prompt to customize the world setting or opening scene
     */
    custom_prompt?: (string | null);
};

