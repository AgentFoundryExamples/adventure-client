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
 * A point of interest (POI) - DEPRECATED for writes, read-only for compatibility.
 *
 * DEPRECATED: This model represents the legacy embedded POI format stored in
 * the world_pois array. It is maintained for backward compatibility during migration.
 *
 * The AUTHORITATIVE POI storage is now the subcollection at:
 * characters/{character_id}/pois/{poi_id}
 *
 * For new POI writes, use PointOfInterestSubcollection and the subcollection helpers
 * in app/firestore.py. This model is read-only and used for:
 * - Reading legacy embedded POIs during migration
 * - Surfacing embedded POIs on GET for backward compatibility
 * - Migration utilities that copy embedded POIs to subcollection
 *
 * See docs/SCHEMA.md for migration guidance and storage contracts.
 *
 * EXACT SHAPE REQUIREMENT: This model must match the exact structure
 * specified in the issue requirements for embedded POIs.
 */
export type PointOfInterest = {
    /**
     * Unique POI identifier
     */
    id: string;
    /**
     * POI name
     */
    name: string;
    /**
     * POI description
     */
    description: string;
    /**
     * When the POI was created/discovered
     */
    created_at?: (string | null);
    /**
     * Tags for categorizing the POI
     */
    tags?: (Array<string> | null);
};

