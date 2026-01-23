/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CharacterIdentity } from './CharacterIdentity';
import type { InventoryItem } from './InventoryItem';
import type { Location } from './Location';
import type { Status } from './Status';
import type { Weapon } from './Weapon';
/**
 * Current player character state using canonical status enum.
 *
 * This model represents the core game state for a character, including:
 * - Character identity (name, race, class)
 * - Health status (canonical Status enum: Healthy, Wounded, Dead)
 * - Equipment (weapons, armor, inventory)
 * - Current location and POI tracking
 * - Extensible additional fields for game-specific data
 *
 * POI Tracking:
 * - at_poi: Boolean flag indicating if character is currently at a POI
 * - current_poi_id: Reference to the POI document when at_poi=True
 * - location: Tracks precise position within POIs or between them
 * (e.g., "Town Square" within a city POI, or "Forest Path" between POIs)
 *
 * Numeric health/stat fields (level, experience, stats, HP, XP) have been
 * removed in favor of the textual status enum. Legacy numeric fields are
 * ignored during deserialization.
 *
 * Referenced in: docs/SCHEMA.md - Character Document Fields (player_state)
 */
export type PlayerState = {
    /**
     * Character identity information
     */
    identity: CharacterIdentity;
    /**
     * Character health status (Healthy, Wounded, Dead)
     */
    status: Status;
    /**
     * Equipped weapons
     */
    equipment?: Array<Weapon>;
    /**
     * Inventory items
     */
    inventory?: Array<InventoryItem>;
    /**
     * Current precise location as Location object, string, or structured object. This tracks minor/precise positions within POIs (e.g., 'Town Square') or between POIs (e.g., 'Forest Path'). For major location tracking, use at_poi and current_poi_id.
     */
    location: (Location | string | Record<string, any>);
    /**
     * Whether the character is currently at a Point of Interest. True when arrived at a major location (city, dungeon, etc.), False when traveling or in minor locations.
     */
    at_poi?: boolean;
    /**
     * ID of the POI the character is currently at (when at_poi=True). References a document in the characters/{character_id}/pois subcollection. None when at_poi=False.
     */
    current_poi_id?: (string | null);
    /**
     * Extensible fields for game-specific data
     */
    additional_fields?: Record<string, any>;
};

