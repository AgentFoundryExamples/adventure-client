/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PointOfInterest } from './PointOfInterest';
/**
 * Response model for random POI sampling.
 */
export type GetRandomPOIsResponse = {
    /**
     * Randomly sampled POIs
     */
    pois: Array<PointOfInterest>;
    /**
     * Number of POIs returned
     */
    count: number;
    /**
     * Number of POIs requested
     */
    requested_n: number;
    /**
     * Total number of POIs available
     */
    total_available: number;
};

