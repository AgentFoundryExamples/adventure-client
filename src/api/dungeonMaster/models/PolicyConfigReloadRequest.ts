/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request for policy config reload endpoint.
 *
 * Triggers manual reload of policy configuration from file or provided values.
 *
 * Attributes:
 * config: Optional new config values to apply (overrides file)
 * actor: Optional actor identity for audit log
 */
export type PolicyConfigReloadRequest = {
    /**
     * Optional new config values to apply (overrides file)
     */
    config?: (Record<string, any> | null);
    /**
     * Optional actor identity for audit log
     */
    actor?: (string | null);
};

