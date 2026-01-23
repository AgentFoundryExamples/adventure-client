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
 * Weapon item with optional special effects.
 *
 * Special effects can be a simple string description or a structured dict
 * with effect details.
 *
 * Referenced in: docs/SCHEMA.md - Player State Equipment
 */
export type Weapon = {
    /**
     * Weapon name
     */
    name: string;
    /**
     * Weapon damage (e.g., '1d8' or 8)
     */
    damage: (number | string);
    /**
     * Special weapon effects as string or structured dict
     */
    special_effects?: (string | Record<string, any> | null);
};

