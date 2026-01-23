/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Generic inventory item with flexible effect field.
 *
 * The effect field supports both simple string descriptions and complex
 * structured effect definitions.
 *
 * Referenced in: docs/SCHEMA.md - Player State Inventory
 */
export type InventoryItem = {
    /**
     * Item name
     */
    name: string;
    /**
     * Number of items
     */
    quantity?: number;
    /**
     * Item effect as string or structured dict
     */
    effect?: (string | Record<string, any> | null);
};

