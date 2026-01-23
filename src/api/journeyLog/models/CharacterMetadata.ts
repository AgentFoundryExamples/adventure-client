/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Status } from './Status';
/**
 * Lightweight character metadata for list responses.
 *
 * Contains essential character information without full state details.
 */
export type CharacterMetadata = {
    /**
     * UUID character identifier
     */
    character_id: string;
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
    class: string;
    /**
     * Character health status
     */
    status: Status;
    /**
     * When the character was created
     */
    created_at: string;
    /**
     * Last update timestamp
     */
    updated_at: string;
};

