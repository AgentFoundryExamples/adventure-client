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
 * Character identity information (name, race, class).
 *
 * Referenced in: docs/SCHEMA.md - Character Document Fields
 */
export type CharacterIdentity = {
    /**
     * Character name (1-64 characters)
     */
    name: string;
    /**
     * Character race (1-64 characters, e.g., Human, Elf, Dwarf)
     */
    race: string;
    /**
     * Character class (1-64 characters, e.g., Warrior, Mage, Ranger)
     */
    class: string;
};

