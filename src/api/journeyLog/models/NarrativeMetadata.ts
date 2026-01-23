/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Metadata for narrative retrieval response.
 */
export type NarrativeMetadata = {
    /**
     * Number of turns requested (n parameter)
     */
    requested_n: number;
    /**
     * Number of turns actually returned
     */
    returned_count: number;
    /**
     * Total number of turns available for this character
     */
    total_available: number;
};

