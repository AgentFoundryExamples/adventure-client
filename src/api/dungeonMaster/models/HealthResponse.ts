/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for health check endpoint.
 *
 * Attributes:
 * status: Service status ("healthy" or "degraded")
 * service: Service name
 * journey_log_accessible: Whether journey-log service is accessible (optional)
 */
export type HealthResponse = {
    /**
     * Service health status
     */
    status: string;
    /**
     * Service name
     */
    service?: string;
    /**
     * Whether journey-log service is accessible (if health check enabled)
     */
    journey_log_accessible?: (boolean | null);
};

