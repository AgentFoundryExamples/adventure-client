/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Point-of-Interest intent from LLM output.
 *
 * Indicates what POI action the narrative implies, if any.
 * The LLM only suggests intents; the service decides actual POI operations.
 *
 * POI MODEL:
 * - POIs are named, significant locations (towns, dungeons, taverns, etc.)
 * - Characters can be IN a POI (location_id set) or have NO POI (traveling)
 * - 'create' action: Character enters/discovers a new named location
 * - 'reference' action: Mention an existing POI without entering it
 * - minor_location (in LocationIntent) is ALWAYS present for precise positioning
 * - Leaving a POI is handled via LocationIntent with action='leave_poi'
 *
 * Attributes:
 * action: POI action type - "none", "create", or "reference"
 * name: Name of the point of interest
 * description: Description of the location
 * reference_tags: Tags for referencing this POI later
 */
export type POIIntent = {
    /**
     * POI action: 'create' (enter/discover new location), 'reference' (mention existing location)
     */
    action?: 'none' | 'create' | 'reference';
    /**
     * Name of the point of interest
     */
    name?: (string | null);
    /**
     * Description of the location
     */
    description?: (string | null);
    /**
     * Tags for referencing this POI in future context
     */
    reference_tags?: (Array<string> | null);
};

