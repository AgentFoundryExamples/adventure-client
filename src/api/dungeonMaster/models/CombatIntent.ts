/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EnemyDescriptor } from './EnemyDescriptor';
/**
 * Combat-related intent from LLM output.
 *
 * Indicates what combat action the narrative implies, if any.
 * The LLM only suggests intents; the service decides actual combat operations.
 *
 * Attributes:
 * action: Combat action type - "none", "start", "continue", or "end"
 * enemies: Optional list of enemy descriptors
 * combat_notes: Optional notes about the combat situation
 */
export type CombatIntent = {
    /**
     * Combat action to perform
     */
    action?: 'none' | 'start' | 'continue' | 'end';
    /**
     * List of enemies in the encounter
     */
    enemies?: (Array<EnemyDescriptor> | null);
    /**
     * Additional notes about the combat situation
     */
    combat_notes?: (string | null);
};

