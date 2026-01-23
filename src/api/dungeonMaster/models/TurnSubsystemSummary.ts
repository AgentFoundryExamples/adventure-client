/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubsystemActionType } from './SubsystemActionType';
/**
 * Summary of subsystem changes made during a turn.
 *
 * This model captures all subsystem actions (quest, combat, POI) that were
 * attempted during turn processing, along with their success/failure status.
 * It enables:
 * - Analytics on subsystem engagement rates
 * - Debugging of failed writes
 * - Verification of orchestration order
 * - Dry-run simulation results
 *
 * All fields default to 'none' action with no success/error, representing
 * no attempted action for that subsystem.
 *
 * Attributes:
 * quest_change: Quest action summary (offered/completed/abandoned/none)
 * combat_change: Combat action summary (started/continued/ended/none)
 * poi_change: POI action summary (created/referenced/none)
 * narrative_persisted: Whether narrative was successfully persisted
 * narrative_error: Error message if narrative persistence failed
 */
export type TurnSubsystemSummary = {
    /**
     * Quest action performed and its result
     */
    quest_change?: SubsystemActionType;
    /**
     * Combat action performed and its result
     */
    combat_change?: SubsystemActionType;
    /**
     * POI action performed and its result
     */
    poi_change?: SubsystemActionType;
    /**
     * Whether narrative was successfully persisted to journey-log
     */
    narrative_persisted?: boolean;
    /**
     * Error message if narrative persistence failed
     */
    narrative_error?: (string | null);
};

