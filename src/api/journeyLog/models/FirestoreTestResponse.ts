/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for Firestore connectivity test.
 */
export type FirestoreTestResponse = {
    /**
     * Test status (success or error)
     */
    status: string;
    /**
     * Human-readable message
     */
    message: string;
    /**
     * ID of the test document
     */
    document_id: string;
    /**
     * Document data read back from Firestore
     */
    data: Record<string, any>;
    /**
     * ISO 8601 timestamp of the test
     */
    timestamp: string;
};

