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

