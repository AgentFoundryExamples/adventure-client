/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NarrativeMetadata } from './NarrativeMetadata';
import type { NarrativeTurn } from './NarrativeTurn';
/**
 * Response model for GET narrative endpoint.
 */
export type GetNarrativeResponse = {
    /**
     * List of narrative turns ordered oldest-to-newest
     */
    turns: Array<NarrativeTurn>;
    /**
     * Metadata about the query results
     */
    metadata: NarrativeMetadata;
};

