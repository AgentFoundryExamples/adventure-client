/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminTurnDetail } from './AdminTurnDetail';
/**
 * Response for admin recent turns endpoint.
 *
 * Returns a list of recent turns for a character in reverse chronological
 * order. Returned by GET /admin/characters/{id}/recent_turns endpoint.
 *
 * Attributes:
 * character_id: Character UUID
 * turns: List of turn details (most recent first)
 * total_count: Total number of turns returned
 * limit: Maximum number of turns requested
 */
export type AdminRecentTurnsResponse = {
    /**
     * Character UUID
     */
    character_id: string;
    /**
     * List of turn details in reverse chronological order
     */
    turns: Array<AdminTurnDetail>;
    /**
     * Total number of turns returned
     */
    total_count: number;
    /**
     * Maximum number of turns requested
     */
    limit: number;
};

