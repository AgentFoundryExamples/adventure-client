/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CombatState_Output } from './CombatState_Output';
/**
 * Combat envelope for context aggregation with derived active flag.
 *
 * This model exposes the active boolean explicitly for Director consumption,
 * computed server-side based on enemy statuses.
 */
export type CombatEnvelope = {
    /**
     * Whether combat is currently active (true if any enemy status != Dead)
     */
    active: boolean;
    /**
     * Full combat state details, or null if combat is inactive
     */
    state?: (CombatState_Output | null);
};

