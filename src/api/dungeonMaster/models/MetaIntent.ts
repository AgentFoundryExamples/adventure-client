/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Meta-level intent about player engagement and pacing.
 *
 * Provides hints about player mood and game pacing for the service to consider.
 * The LLM observes and reports; the service decides actual pacing adjustments.
 *
 * Attributes:
 * player_mood: Optional assessment of player's emotional state
 * pacing_hint: Optional pacing suggestion - "slow", "normal", or "fast"
 * user_is_wandering: Optional flag indicating player seems directionless
 * user_asked_for_guidance: Optional flag indicating player requested help
 */
export type MetaIntent = {
    /**
     * Assessment of player's emotional state
     */
    player_mood?: (string | null);
    /**
     * Suggested pacing for the game flow
     */
    pacing_hint?: ('slow' | 'normal' | 'fast' | null);
    /**
     * Flag indicating player seems to lack direction
     */
    user_is_wandering?: (boolean | null);
    /**
     * Flag indicating player explicitly requested help or guidance
     */
    user_asked_for_guidance?: (boolean | null);
};

