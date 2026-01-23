/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for creating a new character.
 *
 * Attributes:
 * name: Name of the character.
 * race: Race of the character.
 * class_name: Class of the character (e.g., "Warrior", "Mage").
 * custom_prompt: Optional user-provided prompt to shape the world/setting.
 */
export type CharacterCreationRequest = {
    /**
     * Character name
     */
    name: string;
    /**
     * Character race
     */
    race: string;
    /**
     * Character class
     */
    class_name: string;
    /**
     * Optional prompt to customize the world setting or opening scene
     */
    custom_prompt?: (string | null);
};

