/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PointOfInterest } from './PointOfInterest';
/**
 * World state for context aggregation including optional POI sample.
 *
 * POIs can be suppressed via include_pois flag to reduce payload size.
 * The pois_cap field exposes the server configuration for POI sampling limits.
 */
export type WorldContextState = {
    /**
     * Random sample of discovered POIs (empty if include_pois=false)
     */
    pois_sample?: Array<PointOfInterest>;
    /**
     * Maximum number of POIs that can be sampled (server config limit)
     */
    pois_cap: number;
    /**
     * Whether POIs were included in this response (reflects request parameter)
     */
    include_pois: boolean;
};

