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
 * Response model for cleanup operation.
 */
export type CleanupResponse = {
    /**
     * Cleanup status (success or error)
     */
    status: string;
    /**
     * Human-readable message
     */
    message: string;
    /**
     * Number of documents deleted
     */
    deleted_count: number;
    /**
     * ISO 8601 timestamp of the operation
     */
    timestamp: string;
};

