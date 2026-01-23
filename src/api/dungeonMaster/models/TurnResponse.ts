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

