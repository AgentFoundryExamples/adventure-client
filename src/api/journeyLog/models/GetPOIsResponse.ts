/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PointOfInterest } from './PointOfInterest';
/**
 * Response model for getting POIs with pagination.
 */
export type GetPOIsResponse = {
    /**
     * List of POIs sorted by created_at desc
     */
    pois: Array<PointOfInterest>;
    /**
     * Number of POIs returned in this response
     */
    count: number;
    /**
     * Cursor for next page (None if no more results)
     */
    cursor?: (string | null);
};

