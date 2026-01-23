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
 * Response for policy config inspection endpoint.
 *
 * Returns current policy configuration parameters.
 *
 * Attributes:
 * quest_trigger_prob: Current quest trigger probability
 * quest_cooldown_turns: Current quest cooldown in turns
 * poi_trigger_prob: Current POI trigger probability
 * poi_cooldown_turns: Current POI cooldown in turns
 * memory_spark_probability: Current memory spark trigger probability
 * quest_poi_reference_probability: Current quest POI reference probability
 * last_updated: ISO 8601 timestamp of last config change
 */
export type PolicyConfigResponse = {
    /**
     * Current quest trigger probability (0.0-1.0)
     */
    quest_trigger_prob: number;
    /**
     * Current quest cooldown in turns
     */
    quest_cooldown_turns: number;
    /**
     * Current POI trigger probability (0.0-1.0)
     */
    poi_trigger_prob: number;
    /**
     * Current POI cooldown in turns
     */
    poi_cooldown_turns: number;
    /**
     * Current memory spark trigger probability (0.0-1.0)
     */
    memory_spark_probability: number;
    /**
     * Current quest POI reference probability (0.0-1.0)
     */
    quest_poi_reference_probability: number;
    /**
     * ISO 8601 timestamp of last config change
     */
    last_updated?: (string | null);
};

