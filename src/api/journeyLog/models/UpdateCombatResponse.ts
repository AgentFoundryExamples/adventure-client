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
import type { CombatState_Output } from './CombatState_Output';
/**
 * Response model for combat state updates.
 *
 * Returns the active/inactive status and the resulting combat state.
 */
export type UpdateCombatResponse = {
    /**
     * Whether combat is currently active (any enemy not Dead)
     */
    active: boolean;
    /**
     * Current combat state, or null if combat is cleared
     */
    state: (CombatState_Output | null);
};

