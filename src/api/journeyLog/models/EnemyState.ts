/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Status } from './Status';
/**
 * An enemy in combat with status, weapon, and traits.
 *
 * Represents an enemy's state during combat without numeric health tracking.
 * Status enum (Healthy/Wounded/Dead) replaces granular health points.
 *
 * Referenced in: docs/SCHEMA.md - Combat State
 */
export type EnemyState = {
    /**
     * Unique enemy identifier
     */
    enemy_id: string;
    /**
     * Enemy name
     */
    name: string;
    /**
     * Enemy status (Healthy, Wounded, Dead)
     */
    status: Status;
    /**
     * Weapon wielded by the enemy
     */
    weapon?: (string | null);
    /**
     * Enemy traits or characteristics
     */
    traits?: Array<string>;
    /**
     * Additional enemy metadata
     */
    metadata?: (Record<string, any> | null);
};

