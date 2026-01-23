/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Weapon item with optional special effects.
 *
 * Special effects can be a simple string description or a structured dict
 * with effect details.
 *
 * Referenced in: docs/SCHEMA.md - Player State Equipment
 */
export type Weapon = {
    /**
     * Weapon name
     */
    name: string;
    /**
     * Weapon damage (e.g., '1d8' or 8)
     */
    damage: (number | string);
    /**
     * Special weapon effects as string or structured dict
     */
    special_effects?: (string | Record<string, any> | null);
};

