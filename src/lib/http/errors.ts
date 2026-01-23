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
/**
 * HTTP Error Utilities
 * Provides consistent error transformation and handling for API requests
 */

import { config } from '@/config/env';

/**
 * Standard API error structure
 */
export interface ApiError {
  message: string;
  status: number;
  statusText: string;
  data?: unknown;
}

/**
 * Creates a structured API error
 */
export function createApiError(
  message: string,
  status: number,
  statusText: string,
  data?: unknown
): ApiError {
  return { message, status, statusText, data };
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    'statusText' in error
  );
}

/**
 * Logs HTTP errors with appropriate level based on status code
 * Only logs in development mode to avoid console spam in production
 */
export function logHttpError(error: ApiError, context?: string): void {
  if (!config.isDevelopment) {
    return;
  }

  const prefix = context ? `[HTTP Client - ${context}]` : '[HTTP Client]';

  // Log 4xx and 5xx errors differently
  if (error.status >= 500) {
    console.error(`${prefix} Server error (${error.status}):`, error);
  } else if (error.status >= 400) {
    console.warn(`${prefix} Client error (${error.status}):`, error);
  } else {
    console.log(`${prefix} Request failed (${error.status}):`, error);
  }
}

/**
 * Transforms a fetch Response into an ApiError
 */
export async function transformResponseToError(response: Response): Promise<ApiError> {
  let errorData: unknown;
  try {
    errorData = await response.json();
  } catch {
    try {
      errorData = await response.text();
    } catch {
      errorData = null;
    }
  }

  return createApiError(
    `HTTP ${response.status}: ${response.statusText}`,
    response.status,
    response.statusText,
    errorData
  );
}

/**
 * Wraps generic errors as ApiError
 */
export function wrapError(error: unknown, defaultMessage = 'Network request failed'): ApiError {
  if (isApiError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : defaultMessage;
  return createApiError(message, 0, 'Network Error', {
    originalError: error instanceof Error ? error.message : String(error),
  });
}
