/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Quest } from './Quest';
/**
 * An archived/completed quest entry.
 *
 * Stores a completed quest along with when it was cleared.
 * Used in Character.archived_quests array (max 50 entries).
 */
export type QuestArchiveEntry = {
    /**
     * The archived quest
     */
    quest: Quest;
    /**
     * When the quest was completed/cleared
     */
    cleared_at: string;
};

