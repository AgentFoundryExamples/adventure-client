/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Base class for subsystem action types with success/failure tracking.
 *
 * Attributes:
 * action: The action performed (e.g., "offer", "complete", "none")
 * success: Whether the action succeeded (None if not attempted)
 * error: Error message if action failed (None if success or not attempted)
 */
export type SubsystemActionType = {
    /**
     * Action performed or 'none' if no action
     */
    action: string;
    /**
     * Whether the action succeeded (None if not attempted)
     */
    success?: (boolean | null);
    /**
     * Error message if action failed
     */
    error?: (string | null);
};

