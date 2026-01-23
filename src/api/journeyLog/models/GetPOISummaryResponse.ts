/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PointOfInterest } from './PointOfInterest';
/**
 * Response model for lightweight POI summary.
 */
export type GetPOISummaryResponse = {
    /**
     * Total number of POIs for this character
     */
    total_count: number;
    /**
     * Preview of POIs (capped sample, newest first)
     */
    preview: Array<PointOfInterest>;
    /**
     * Number of POIs in preview
     */
    preview_count: number;
};

