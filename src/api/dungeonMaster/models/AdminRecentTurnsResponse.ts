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
import type { AdminTurnDetail } from './AdminTurnDetail';
/**
 * Response for admin recent turns endpoint.
 *
 * Returns a list of recent turns for a character in reverse chronological
 * order. Returned by GET /admin/characters/{id}/recent_turns endpoint.
 *
 * Attributes:
 * character_id: Character UUID
 * turns: List of turn details (most recent first)
 * total_count: Total number of turns returned
 * limit: Maximum number of turns requested
 */
export type AdminRecentTurnsResponse = {
    /**
     * Character UUID
     */
    character_id: string;
    /**
     * List of turn details in reverse chronological order
     */
    turns: Array<AdminTurnDetail>;
    /**
     * Total number of turns returned
     */
    total_count: number;
    /**
     * Maximum number of turns requested
     */
    limit: number;
};

