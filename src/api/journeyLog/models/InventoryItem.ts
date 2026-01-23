// Copyright 2025 John Brosnihan
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
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

