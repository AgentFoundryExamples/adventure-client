/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for updating an existing POI.
 */
export type UpdatePOIRequest = {
    /**
     * POI name (1-200 characters)
     */
    name?: (string | null);
    /**
     * POI description (1-2000 characters)
     */
    description?: (string | null);
    /**
     * Whether the POI has been visited
     */
    visited?: (boolean | null);
    /**
     * Tags for categorizing the POI (max 20 tags)
     */
    tags?: (Array<string> | null);
};

