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
import type { NarrativeTurn } from './NarrativeTurn';
/**
 * Narrative context for context aggregation.
 *
 * Provides recent narrative turns with metadata about the requested,
 * returned, and maximum narrative window to help Directors understand
 * context boundaries.
 */
export type NarrativeContext = {
    /**
     * List of recent narrative turns ordered oldest-to-newest (chronological)
     */
    recent_turns?: Array<NarrativeTurn>;
    /**
     * Number of turns requested via recent_n parameter
     */
    requested_n: number;
    /**
     * Number of turns actually returned (may be less than requested if not enough exist)
     */
    returned_n: number;
    /**
     * Maximum number of turns that can be requested (server config limit)
     */
    max_n: number;
};

