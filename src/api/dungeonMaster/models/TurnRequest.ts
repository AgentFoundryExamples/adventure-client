/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for a turn in the game.
 *
 * Attributes:
 * character_id: UUID or string identifier for the character
 * user_action: The player's action/input for this turn
 * user_id: Optional user ID for request tracking and correlation (passed as X-User-Id to journey-log)
 */
export type TurnRequest = {
    /**
     * Character UUID identifier
     */
    character_id: string;
    /**
     * Player's action or input for this turn
     */
    user_action: string;
};

