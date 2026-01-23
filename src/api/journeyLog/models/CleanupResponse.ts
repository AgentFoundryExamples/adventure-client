/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for cleanup operation.
 */
export type CleanupResponse = {
    /**
     * Cleanup status (success or error)
     */
    status: string;
    /**
     * Human-readable message
     */
    message: string;
    /**
     * Number of documents deleted
     */
    deleted_count: number;
    /**
     * ISO 8601 timestamp of the operation
     */
    timestamp: string;
};

