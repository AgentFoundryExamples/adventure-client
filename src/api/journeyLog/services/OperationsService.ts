/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CleanupResponse } from '../models/CleanupResponse';
import type { FirestoreTestResponse } from '../models/FirestoreTestResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OperationsService {
    /**
     * Test Firestore connectivity
     * **OPERATIONAL ENDPOINT** - Verifies Firestore read/write access.
     *
     * **SECURITY WARNING**: This endpoint should be protected with authentication in production. Use Cloud Run IAM or other auth mechanisms.
     *
     * This endpoint performs the following operations:
     * 1. Writes a test document to the configured test collection
     * 2. Reads the document back to verify read access
     * 3. Returns the document data
     *
     * Test documents are NOT automatically cleaned up. Use the DELETE endpoint to remove old test documents.
     *
     * **Required IAM Roles:**
     * - `roles/datastore.user` (or equivalent Firestore permissions)
     * - `roles/run.invoker` (to access the endpoint on Cloud Run)
     * @returns FirestoreTestResponse Firestore connectivity test successful
     * @throws ApiError
     */
    public static testFirestorePostFirestoreTestPost(): CancelablePromise<FirestoreTestResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/firestore-test',
            errors: {
                500: `Firestore connectivity test failed`,
            },
        });
    }
    /**
     * Clean up test documents
     * **OPERATIONAL ENDPOINT** - Removes test documents from Firestore.
     *
     * **SECURITY WARNING**: This endpoint should be protected with authentication in production. Use Cloud Run IAM or other auth mechanisms.
     *
     * This endpoint deletes all documents from the test collection to prevent accumulation of test data. Use this periodically to maintain a clean database.
     *
     * **Required IAM Roles:**
     * - `roles/datastore.user` (or equivalent Firestore permissions)
     * - `roles/run.invoker` (to access the endpoint on Cloud Run)
     * @returns CleanupResponse Test documents cleaned up successfully
     * @throws ApiError
     */
    public static cleanupTestDocumentsFirestoreTestDelete(): CancelablePromise<CleanupResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/firestore-test',
            errors: {
                500: `Cleanup operation failed`,
            },
        });
    }
}
