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
import type { QuestRewards } from './QuestRewards';
/**
 * A quest with requirements and rewards.
 *
 * EXACT SHAPE REQUIREMENT: This model must match the exact structure
 * specified in the issue requirements for embedded quests.
 *
 * Referenced in: docs/SCHEMA.md - Character Document Fields (active_quest)
 */
export type Quest = {
    /**
     * Quest name
     */
    name: string;
    /**
     * Quest description
     */
    description: string;
    /**
     * List of quest requirement descriptions
     */
    requirements?: Array<string>;
    /**
     * Quest rewards
     */
    rewards: QuestRewards;
    /**
     * Quest completion status: 'not_started', 'in_progress', or 'completed'
     */
    completion_state: 'not_started' | 'in_progress' | 'completed';
    /**
     * When the quest was last updated
     */
    updated_at: string;
};

