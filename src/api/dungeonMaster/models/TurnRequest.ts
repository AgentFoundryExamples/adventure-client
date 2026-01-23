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
 * Request model for a turn in the game.
 *
 * Attributes:
 * character_id: UUID or string identifier for the character
 * user_action: The player's action/input for this turn
 * user_id: Optional user ID for request tracking and correlation (passed as X-User-Id to journey-log)
 */
export type TurnRequest = {
    /**
     * Character UUID identifier
     */
    character_id: string;
    /**
     * Player's action or input for this turn
     */
    user_action: string;
};

