/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Location intent for setting or updating character location.
 *
 * LOCATION MODEL:
 * - Characters can be IN a POI (major named location) or have NO POI (traveling/between)
 * - minor_location is ALWAYS present - describes where they are right now
 * - When in a POI: minor_location is position within that POI (e.g., 'at the bar')
 * - When not in a POI: minor_location describes the transitional state (e.g., 'on the road to town')
 *
 * Used during character creation to establish starting location (with origin POI),
 * and during gameplay to track movement and transitions.
 *
 * Attributes:
 * location_id: Machine-readable POI identifier (null when between locations)
 * location_display_name: Human-readable POI name (null when between locations)
 * minor_location: ALWAYS present - precise current position (within POI or between POIs)
 * action: Action type - 'none', 'update_minor', 'leave_poi'
 */
export type LocationIntent = {
    /**
     * Machine-readable POI identifier when IN a location (null when traveling between POIs)
     */
    location_id?: (string | null);
    /**
     * Human-readable POI name when IN a location (null when traveling between POIs)
     */
    location_display_name?: (string | null);
    /**
     * ALWAYS provide - precise current position (within POI or between POIs)
     */
    minor_location?: (string | null);
    /**
     * Location action: 'none' (no change), 'update_minor' (update minor_location), 'leave_poi' (exit current POI)
     */
    action?: 'none' | 'update_minor' | 'leave_poi';
};

