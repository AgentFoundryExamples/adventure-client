/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Admin turn detail for introspection endpoint.
 *
 * Provides comprehensive turn state for debugging including inputs,
 * decisions, LLM outputs, and journey-log writes. Returned by
 * GET /admin/turns/{turn_id} endpoint.
 *
 * Attributes:
 * turn_id: Unique turn identifier
 * character_id: Character UUID
 * timestamp: ISO 8601 timestamp of turn start
 * user_action: Player's input action
 * context_snapshot: Redacted character context at turn time
 * policy_decisions: Policy engine decisions (quest/POI eligibility, rolls)
 * llm_narrative: Generated narrative text (may be truncated)
 * llm_intents: Structured intents from LLM output
 * journey_log_writes: Summary of subsystem writes (quest, combat, POI, narrative)
 * errors: List of errors encountered during turn processing
 * latency_ms: Total turn processing time in milliseconds
 * redacted: Whether sensitive data was redacted from response
 */
export type AdminTurnDetail = {
    /**
     * Unique turn identifier
     */
    turn_id: string;
    /**
     * Character UUID
     */
    character_id: string;
    /**
     * ISO 8601 timestamp of turn start
     */
    timestamp: string;
    /**
     * Player's input action
     */
    user_action: string;
    /**
     * Character context snapshot at turn time (redacted)
     */
    context_snapshot: Record<string, any>;
    /**
     * Policy engine decisions for quest/POI triggers
     */
    policy_decisions: Record<string, any>;
    /**
     * Generated narrative text (may be truncated)
     */
    llm_narrative?: (string | null);
    /**
     * Structured intents from LLM output
     */
    llm_intents?: (Record<string, any> | null);
    /**
     * Summary of subsystem writes (quest, combat, POI, narrative)
     */
    journey_log_writes: Record<string, any>;
    /**
     * List of errors encountered during turn processing
     */
    errors?: Array<Record<string, string>>;
    /**
     * Total turn processing time in milliseconds
     */
    latency_ms?: (number | null);
    /**
     * Whether sensitive data was redacted from response
     */
    redacted?: boolean;
};

