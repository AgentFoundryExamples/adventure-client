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

/**
 * Maps HTTP status codes to user-friendly error messages
 * Provides actionable copy for common HTTP errors with retry guidance
 */
export function getHttpErrorMessage(statusCode: number, context?: string): string {
  const prefix = context ? `${context}: ` : '';
  
  switch (statusCode) {
    case 400:
      return `${prefix}Invalid request. Please check your input and try again.`;
    case 401:
      return `${prefix}Authentication failed. Please log in again.`;
    case 403:
      return `${prefix}Access denied. You don't have permission to access this resource.`;
    case 404:
      return `${prefix}Resource not found. It may have been moved or deleted.`;
    case 408:
      return `${prefix}Request timeout. Please check your connection and try again.`;
    case 429:
      return `${prefix}Too many requests. Please wait a moment before trying again.`;
    case 500:
      return `${prefix}Server error. Please try again later or contact support.`;
    case 502:
      return `${prefix}Service temporarily unavailable. Please try again in a few moments.`;
    case 503:
      return `${prefix}Service under maintenance. Please try again later.`;
    case 504:
      return `${prefix}Gateway timeout. The server is taking too long to respond.`;
    default:
      if (statusCode >= 500) {
        return `${prefix}Server error (${statusCode}). Please try again later.`;
      } else if (statusCode >= 400) {
        return `${prefix}Request failed (${statusCode}). Please check your input.`;
      } else if (statusCode === 0) {
        return `${prefix}Network error. Please check your internet connection.`;
      }
      return `${prefix}An unexpected error occurred (${statusCode}).`;
  }
}

/**
 * Determines if an error is likely transient and worth retrying
 */
export function isTransientError(statusCode: number): boolean {
  return [408, 429, 500, 502, 503, 504].includes(statusCode) || statusCode === 0;
}

/**
 * Gets a friendly error message from an ApiError or unknown error
 * Includes context and retry guidance where appropriate
 */
export function getFriendlyErrorMessage(error: unknown, context?: string): {
  message: string;
  shouldRetry: boolean;
} {
  // Check if error has a status code (ApiError or similar error objects)
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status;
    return {
      message: getHttpErrorMessage(status, context),
      shouldRetry: isTransientError(status),
    };
  }

  // Handle network errors
  if (error instanceof Error) {
    const errorName = error.name.toLowerCase();
    
    // Network timeout or offline
    if (errorName === 'aborterror' || error.message.toLowerCase().includes('timeout')) {
      return {
        message: context 
          ? `${context}: Request timeout. Please check your connection and try again.`
          : 'Request timeout. Please check your connection and try again.',
        shouldRetry: true,
      };
    }
    
    // Network error or fetch failure
    if (errorName === 'networkerror' || error.message.toLowerCase().includes('failed to fetch')) {
      return {
        message: context
          ? `${context}: Network error. Please check your internet connection.`
          : 'Network error. Please check your internet connection.',
        shouldRetry: true,
      };
    }

    return {
      message: context ? `${context}: ${error.message}` : error.message,
      shouldRetry: false,
    };
  }

  return {
    message: context 
      ? `${context}: An unexpected error occurred.`
      : 'An unexpected error occurred.',
    shouldRetry: false,
  };
}
