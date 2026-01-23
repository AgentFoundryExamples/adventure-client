/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Location information with ID and display name.
 *
 * Represents a character's current location in the game world.
 * The ID is used for internal references and logic, while display_name
 * is shown to the player.
 *
 * Referenced in: docs/SCHEMA.md - Character Document Fields
 */
export type Location = {
    /**
     * Location identifier (e.g., 'origin:nexus', 'town:rivendell')
     */
    id: string;
    /**
     * Human-readable location name
     */
    display_name: string;
};

