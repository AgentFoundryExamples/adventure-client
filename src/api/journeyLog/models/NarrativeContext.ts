/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NarrativeTurn } from './NarrativeTurn';
/**
 * Narrative context for context aggregation.
 *
 * Provides recent narrative turns with metadata about the requested,
 * returned, and maximum narrative window to help Directors understand
 * context boundaries.
 */
export type NarrativeContext = {
    /**
     * List of recent narrative turns ordered oldest-to-newest (chronological)
     */
    recent_turns?: Array<NarrativeTurn>;
    /**
     * Number of turns requested via recent_n parameter
     */
    requested_n: number;
    /**
     * Number of turns actually returned (may be less than requested if not enough exist)
     */
    returned_n: number;
    /**
     * Maximum number of turns that can be requested (server config limit)
     */
    max_n: number;
};

