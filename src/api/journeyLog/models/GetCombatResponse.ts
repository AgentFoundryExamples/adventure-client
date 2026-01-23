/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CombatState_Output } from './CombatState_Output';
/**
 * Response model for combat state retrieval.
 *
 * Returns the active/inactive status and the current combat state.
 * This is the standard envelope for LLM-driven Directors to poll combat state.
 */
export type GetCombatResponse = {
    /**
     * Whether combat is currently active (any enemy not Dead)
     */
    active: boolean;
    /**
     * Current combat state, or null if no combat is active
     */
    state: (CombatState_Output | null);
};

