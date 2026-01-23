/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CharacterMetadata } from './CharacterMetadata';
/**
 * Response model for character list retrieval.
 */
export type ListCharactersResponse = {
    /**
     * List of character metadata objects
     */
    characters: Array<CharacterMetadata>;
    /**
     * Number of characters returned in this response (after pagination)
     */
    count: number;
};

