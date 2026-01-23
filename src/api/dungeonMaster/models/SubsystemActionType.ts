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
 * Base class for subsystem action types with success/failure tracking.
 *
 * Attributes:
 * action: The action performed (e.g., "offer", "complete", "none")
 * success: Whether the action succeeded (None if not attempted)
 * error: Error message if action failed (None if success or not attempted)
 */
export type SubsystemActionType = {
    /**
     * Action performed or 'none' if no action
     */
    action: string;
    /**
     * Whether the action succeeded (None if not attempted)
     */
    success?: (boolean | null);
    /**
     * Error message if action failed
     */
    error?: (string | null);
};

