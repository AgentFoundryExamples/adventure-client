/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Metadata describing read limits and caps for context aggregation.
 *
 * Exposes server configuration to help Directors understand:
 * - Firestore read pattern (1 character doc + 1 narrative query + optional 1 POI query)
 * - Configured limits for narrative and POI caps
 * - Current request parameters
 */
export type ContextCapsMetadata = {
    /**
     * Expected Firestore read pattern for this request
     */
    firestore_reads?: string;
    /**
     * Maximum narrative turns that can be requested (server config)
     */
    narrative_max_n: number;
    /**
     * Number of narrative turns requested in this call
     */
    narrative_requested_n: number;
    /**
     * Maximum POIs that can be sampled (server config)
     */
    pois_cap: number;
    /**
     * Whether POIs were requested via include_pois parameter
     */
    pois_requested: boolean;
};

