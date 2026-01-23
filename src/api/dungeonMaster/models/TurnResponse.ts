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
import type { IntentsBlock } from './IntentsBlock';
import type { TurnSubsystemSummary } from './TurnSubsystemSummary';
/**
 * Response model for a turn in the game.
 *
 * Attributes:
 * narrative: The AI-generated narrative response for the player's action
 * intents: Optional structured intents from the LLM (informational only, not persisted)
 * subsystem_summary: Optional summary of subsystem changes made during this turn
 */
export type TurnResponse = {
    /**
     * AI-generated narrative response
     */
    narrative: string;
    /**
     * Structured intents from LLM output (informational only). Only available when LLM response is valid. Note: Only narrative is persisted to journey-log; intents are descriptive.
     */
    intents?: (IntentsBlock | null);
    /**
     * Summary of subsystem changes made during this turn. Includes quest, combat, and POI actions with success/failure status. Only available when orchestrator is used.
     */
    subsystem_summary?: (TurnSubsystemSummary | null);
};

