/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Quest-related intent from LLM output.
 *
 * Indicates what quest action the narrative implies, if any.
 * The LLM only suggests intents; the service decides actual quest operations.
 *
 * QUEST PHILOSOPHY:
 * - Quests are driving narrative elements, not optional offers
 * - When policy allows, quests START immediately as part of the story
 * - LLM should focus on ADVANCING quests when player actions align
 * - completion_state tracks progress: 'not_started', 'in_progress', 'completed'
 *
 * Attributes:
 * action: Quest action type - "none", "start", "advance", "complete", or "abandon"
 * quest_title: Optional title of the quest
 * quest_summary: Optional brief summary of the quest objective
 * quest_details: Optional dictionary of additional quest metadata
 * progress_update: Optional description of quest progress when action='advance'
 */
export type QuestIntent = {
    /**
     * Quest action: 'start' (begin new quest), 'advance' (progress active quest), 'complete' (finish quest), 'abandon' (give up)
     */
    action?: 'none' | 'start' | 'advance' | 'complete' | 'abandon';
    /**
     * Title of the quest (required for 'start' action)
     */
    quest_title?: (string | null);
    /**
     * Brief summary of the quest objective (required for 'start' action)
     */
    quest_summary?: (string | null);
    /**
     * Additional quest metadata and details
     */
    quest_details?: (Record<string, any> | null);
    /**
     * Description of progress made when action='advance' (e.g., 'Found a clue at the mill', 'Defeated the bandits')
     */
    progress_update?: (string | null);
};

