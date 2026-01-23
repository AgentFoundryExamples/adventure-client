/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CombatState_Input } from './CombatState_Input';
/**
 * Request model for updating combat state.
 *
 * The combat_state field accepts a full CombatState object or null to clear combat.
 * Server-side validation ensures ≤5 enemies and valid status enum values.
 */
export type UpdateCombatRequest = {
    /**
     * Full combat state to set, or null to clear combat
     */
    combat_state: (CombatState_Input | null);
};

