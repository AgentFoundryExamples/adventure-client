/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Character identity information (name, race, class).
 *
 * Referenced in: docs/SCHEMA.md - Character Document Fields
 */
export type CharacterIdentity = {
    /**
     * Character name (1-64 characters)
     */
    name: string;
    /**
     * Character race (1-64 characters, e.g., Human, Elf, Dwarf)
     */
    race: string;
    /**
     * Character class (1-64 characters, e.g., Warrior, Mage, Ranger)
     */
    class: string;
};

