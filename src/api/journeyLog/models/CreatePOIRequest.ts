/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for creating a new POI for a character.
 *
 * Required fields:
 * - name: POI name (1-200 characters)
 * - description: POI description (1-2000 characters)
 *
 * Optional fields:
 * - timestamp: When the POI was discovered (ISO 8601 string, defaults to server UTC now)
 * - tags: List of tags for categorizing the POI (max 20 tags, each max 50 chars)
 */
export type CreatePOIRequest = {
    /**
     * POI name (1-200 characters)
     */
    name: string;
    /**
     * POI description (1-2000 characters)
     */
    description: string;
    /**
     * Optional ISO 8601 timestamp when POI was discovered. Defaults to server UTC now if omitted.
     */
    timestamp?: (string | null);
    /**
     * Optional list of tags for categorizing the POI (max 20 tags)
     */
    tags?: (Array<string> | null);
};

