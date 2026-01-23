/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuestRewards } from './QuestRewards';
/**
 * A quest with requirements and rewards.
 *
 * EXACT SHAPE REQUIREMENT: This model must match the exact structure
 * specified in the issue requirements for embedded quests.
 *
 * Referenced in: docs/SCHEMA.md - Character Document Fields (active_quest)
 */
export type Quest = {
    /**
     * Quest name
     */
    name: string;
    /**
     * Quest description
     */
    description: string;
    /**
     * List of quest requirement descriptions
     */
    requirements?: Array<string>;
    /**
     * Quest rewards
     */
    rewards: QuestRewards;
    /**
     * Quest completion status: 'not_started', 'in_progress', or 'completed'
     */
    completion_state: 'not_started' | 'in_progress' | 'completed';
    /**
     * When the quest was last updated
     */
    updated_at: string;
};

