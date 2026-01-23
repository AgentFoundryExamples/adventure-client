/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for creating a new character.
 *
 * Required fields:
 * - name: Character name (1-64 characters)
 * - race: Character race (1-64 characters)
 * - class: Character class (1-64 characters)
 * - adventure_prompt: Initial adventure prompt or backstory (non-empty)
 *
 * Optional fields:
 * - location_id: Override default starting location (default: origin:nexus)
 * - location_display_name: Display name for location override
 */
export type CreateCharacterRequest = {
    /**
     * Character name (1-64 characters)
     */
    name: string;
    /**
     * Character race (1-64 characters)
     */
    race: string;
    /**
     * Character class (1-64 characters)
     */
    class: string;
    /**
     * Initial adventure prompt or backstory
     */
    adventure_prompt: string;
    /**
     * Optional location ID override (default: origin:nexus)
     */
    location_id?: (string | null);
    /**
     * Display name for location override
     */
    location_display_name?: (string | null);
};

