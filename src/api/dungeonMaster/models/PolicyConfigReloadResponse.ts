/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PolicyConfigResponse } from './PolicyConfigResponse';
/**
 * Response for policy config reload endpoint.
 *
 * Returns success/failure status and error details if reload failed.
 *
 * Attributes:
 * success: Whether config reload succeeded
 * message: Human-readable status message
 * error: Error details if reload failed
 * config: Current config after reload attempt
 */
export type PolicyConfigReloadResponse = {
    /**
     * Whether config reload succeeded
     */
    success: boolean;
    /**
     * Human-readable status message
     */
    message: string;
    /**
     * Error details if reload failed
     */
    error?: (string | null);
    /**
     * Current config after reload attempt
     */
    config?: (PolicyConfigResponse | null);
};

