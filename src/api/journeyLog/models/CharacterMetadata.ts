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
import type { Status } from './Status';
/**
 * Lightweight character metadata for list responses.
 *
 * Contains essential character information without full state details.
 */
export type CharacterMetadata = {
    /**
     * UUID character identifier
     */
    character_id: string;
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
    class: string;
    /**
     * Character health status
     */
    status: Status;
    /**
     * When the character was created
     */
    created_at: string;
    /**
     * Last update timestamp
     */
    updated_at: string;
};

