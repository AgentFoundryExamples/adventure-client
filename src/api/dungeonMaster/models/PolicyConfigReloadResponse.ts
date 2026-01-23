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
import type { PolicyConfigResponse } from './PolicyConfigResponse';
/**
 * Response for policy config reload endpoint.
 *
 * Returns success/failure status and error details if reload failed.
 *
 * Attributes:
 * success: Whether config reload succeeded
 * message: Human-readable status message
 * error: Error details if reload failed
 * config: Current config after reload attempt
 */
export type PolicyConfigReloadResponse = {
    /**
     * Whether config reload succeeded
     */
    success: boolean;
    /**
     * Human-readable status message
     */
    message: string;
    /**
     * Error details if reload failed
     */
    error?: (string | null);
    /**
     * Current config after reload attempt
     */
    config?: (PolicyConfigResponse | null);
};

