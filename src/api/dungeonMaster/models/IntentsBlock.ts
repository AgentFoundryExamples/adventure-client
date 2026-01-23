/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CombatIntent } from './CombatIntent';
import type { LocationIntent } from './LocationIntent';
import type { MetaIntent } from './MetaIntent';
import type { POIIntent } from './POIIntent';
import type { QuestIntent } from './QuestIntent';
/**
 * Collection of all intent types from LLM output.
 *
 * Groups all possible intents that the LLM can suggest based on the narrative.
 * All fields are optional as the LLM may not suggest any specific intent.
 *
 * Note: The LLM fills these intents based on narrative content, but the
 * DungeonMaster service logic determines actual subsystem eligibility and
 * operations based on game state.
 *
 * Attributes:
 * quest_intent: Optional quest-related intent
 * combat_intent: Optional combat-related intent
 * poi_intent: Optional point-of-interest intent
 * location_intent: Optional location intent for setting character location
 * meta: Optional meta-level intent about player engagement
 */
export type IntentsBlock = {
    /**
     * Quest-related intent, if any
     */
    quest_intent?: (QuestIntent | null);
    /**
     * Combat-related intent, if any
     */
    combat_intent?: (CombatIntent | null);
    /**
     * Point-of-interest intent, if any
     */
    poi_intent?: (POIIntent | null);
    /**
     * Location intent for setting character location (used primarily during character creation)
     */
    location_intent?: (LocationIntent | null);
    /**
     * Meta-level intent about player engagement and pacing
     */
    meta?: (MetaIntent | null);
};

