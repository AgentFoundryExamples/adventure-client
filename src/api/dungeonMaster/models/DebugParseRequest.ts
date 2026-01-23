/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for debug parse endpoint.
 *
 * Attributes:
 * llm_response: Raw JSON string from LLM to parse
 * user_id: Optional user ID for request correlation
 */
export type DebugParseRequest = {
    /**
     * Raw JSON string from LLM to validate
     */
    llm_response: string;
    /**
     * Optional user ID for request tracking
     */
    user_id?: (string | null);
};

