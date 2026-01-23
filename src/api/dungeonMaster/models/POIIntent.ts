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
 * Point-of-Interest intent from LLM output.
 *
 * Indicates what POI action the narrative implies, if any.
 * The LLM only suggests intents; the service decides actual POI operations.
 *
 * POI MODEL:
 * - POIs are named, significant locations (towns, dungeons, taverns, etc.)
 * - Characters can be IN a POI (location_id set) or have NO POI (traveling)
 * - 'create' action: Character enters/discovers a new named location
 * - 'reference' action: Mention an existing POI without entering it
 * - minor_location (in LocationIntent) is ALWAYS present for precise positioning
 * - Leaving a POI is handled via LocationIntent with action='leave_poi'
 *
 * Attributes:
 * action: POI action type - "none", "create", or "reference"
 * name: Name of the point of interest
 * description: Description of the location
 * reference_tags: Tags for referencing this POI later
 */
export type POIIntent = {
    /**
     * POI action: 'create' (enter/discover new location), 'reference' (mention existing location)
     */
    action?: 'none' | 'create' | 'reference';
    /**
     * Name of the point of interest
     */
    name?: (string | null);
    /**
     * Description of the location
     */
    description?: (string | null);
    /**
     * Tags for referencing this POI in future context
     */
    reference_tags?: (Array<string> | null);
};

