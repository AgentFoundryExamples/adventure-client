/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Descriptor for an enemy in combat.
 *
 * Used by CombatIntent to describe enemies encountered in combat.
 *
 * Attributes:
 * name: Optional name of the enemy (e.g., "Goblin Scout")
 * description: Optional description of the enemy's appearance or behavior
 * threat: Optional threat level or classification (e.g., "low", "medium", "high")
 */
export type EnemyDescriptor = {
    /**
     * Name of the enemy
     */
    name?: (string | null);
    /**
     * Description of the enemy's appearance or behavior
     */
    description?: (string | null);
    /**
     * Threat level or classification
     */
    threat?: (string | null);
};

