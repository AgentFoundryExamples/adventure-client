/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NarrativeTurn } from './NarrativeTurn';
/**
 * Response model for narrative turn append.
 */
export type AppendNarrativeResponse = {
    /**
     * The stored narrative turn
     */
    turn: NarrativeTurn;
    /**
     * Total number of narrative turns for this character
     */
    total_turns: number;
};

