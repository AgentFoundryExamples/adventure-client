/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Rewards for completing a quest.
 *
 * EXACT SHAPE REQUIREMENT: This model must match the exact structure
 * specified in the issue requirements.
 *
 * Validates that all numeric values are non-negative.
 */
export type QuestRewards = {
    /**
     * List of item names awarded
     */
    items?: Array<string>;
    /**
     * Currency rewards as name:amount pairs
     */
    currency?: Record<string, number>;
    /**
     * Experience points awarded (non-negative)
     */
    experience?: (number | null);
};

