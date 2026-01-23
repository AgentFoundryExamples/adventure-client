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
 * Request model for updating an existing POI.
 */
export type UpdatePOIRequest = {
    /**
     * POI name (1-200 characters)
     */
    name?: (string | null);
    /**
     * POI description (1-2000 characters)
     */
    description?: (string | null);
    /**
     * Whether the POI has been visited
     */
    visited?: (boolean | null);
    /**
     * Tags for categorizing the POI (max 20 tags)
     */
    tags?: (Array<string> | null);
};

