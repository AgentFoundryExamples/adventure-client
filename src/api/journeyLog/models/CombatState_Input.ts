/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EnemyState } from './EnemyState';
/**
 * Current combat state with up to 5 enemies.
 *
 * Represents an active combat encounter, including enemies and combat status.
 * When not in combat, the combat_state field in CharacterDocument should be None.
 *
 * Combat is considered inactive when all enemies are Dead or the enemy list is empty.
 * Maximum 5 enemies per combat to prevent document bloat.
 *
 * Referenced in: docs/SCHEMA.md - Character Document Fields (combat_state)
 */
export type CombatState_Input = {
    /**
     * Unique combat identifier
     */
    combat_id: string;
    /**
     * When combat started
     */
    started_at: string;
    /**
     * Current combat turn
     */
    turn?: number;
    /**
     * List of enemies in combat (max 5)
     */
    enemies: Array<EnemyState>;
    /**
     * Player status effects and conditions during combat
     */
    player_conditions?: (Record<string, any> | null);
};

