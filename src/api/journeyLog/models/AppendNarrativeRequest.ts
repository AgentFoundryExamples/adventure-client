/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for appending a narrative turn to a character.
 *
 * Required fields:
 * - user_action: Player's action or input (1-8000 characters)
 * - ai_response: Game master's/AI's response (1-32000 characters)
 *
 * Optional fields:
 * - timestamp: When the turn occurred (ISO 8601 string). Defaults to server UTC now if omitted.
 *
 * Validation:
 * - user_action: max 8000 characters
 * - ai_response: max 32000 characters
 * - Combined length: max 40000 characters
 */
export type AppendNarrativeRequest = {
    /**
     * Player's action or input (max 8000 characters)
     */
    user_action: string;
    /**
     * Game master's/AI's response (max 32000 characters)
     */
    ai_response: string;
    /**
     * Optional ISO 8601 timestamp. Defaults to server UTC now if omitted.
     */
    timestamp?: (string | null);
};

