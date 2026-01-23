/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for character creation.
 *
 * Attributes:
 * character_id: The UUID of the created character.
 * narrative: The introductory narrative scene.
 */
export type CharacterCreationResponse = {
    /**
     * UUID of the created character
     */
    character_id: string;
    /**
     * Introductory narrative scene
     */
    narrative: string;
};

