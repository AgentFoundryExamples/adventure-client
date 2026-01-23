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
 * HTTP Client Utility
 * Centralized HTTP client using fetch API with JSON helpers, error handling, and auth integration
 */

import { config } from '@/config/env';
import {
  createApiError,
  isApiError as isApiErrorUtil,
  logHttpError,
  transformResponseToError,
  wrapError,
  type ApiError,
} from './errors';

/**
 * HTTP request options
 */
export interface RequestOptions extends RequestInit {
  baseUrl?: string;
  timeout?: number;
  skipAuth?: boolean;
}

/**
 * Auth provider interface for dependency injection
 */
export interface AuthProvider {
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  uid: string | null;
}

/**
 * Global auth provider instance (set via setAuthProvider)
 */
let authProvider: AuthProvider | null = null;

/**
 * Sets the global auth provider for HTTP client
 * Should be called once during app initialization
 */
export function setAuthProvider(provider: AuthProvider | null): void {
  authProvider = provider;
}

/**
 * Gets the current auth provider
 */
export function getAuthProvider(): AuthProvider | null {
  return authProvider;
}

/**
 * Enhanced fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestOptions & { timeout?: number }
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw createApiError('Request timeout', 408, 'Request Timeout', { timeout });
    }
    throw error;
  }
}

/**
 * Service type mappings for URL-based service detection
 */
const SERVICE_TYPE_MAPPINGS = {
  [config.dungeonMasterApiUrl]: 'dungeon-master' as const,
  [config.journeyLogApiUrl]: 'journey-log' as const,
};

/**
 * Determines which service the URL belongs to
 */
function getServiceType(url: string): 'dungeon-master' | 'journey-log' | null {
  for (const [baseUrl, serviceType] of Object.entries(SERVICE_TYPE_MAPPINGS)) {
    if (url.includes(baseUrl)) {
      return serviceType;
    }
  }
  return null;
}

/**
 * Base HTTP request handler with auth integration
 * @throws ApiError for non-2xx responses
 */
async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
  retryCount = 0
): Promise<T> {
  const { baseUrl, skipAuth = false, ...fetchOptions } = options;

  // Build full URL
  const url = baseUrl
    ? `${baseUrl}${endpoint}`
    : endpoint.startsWith('http')
      ? endpoint
      : `${config.dungeonMasterApiUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Add auth headers if auth provider is available and not skipped
  if (!skipAuth && authProvider) {
    const serviceType = getServiceType(url);

    try {
      // Determine if token should be force-refreshed (on retry after 401)
      const forceRefresh = retryCount > 0;
      
      // Add service-specific auth headers
      if (serviceType === 'dungeon-master') {
        // Dungeon Master API requires Authorization: Bearer token
        const token = await authProvider.getIdToken(forceRefresh);
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else if (serviceType === 'journey-log') {
        // Journey Log API requires X-User-Id header
        if (authProvider.uid) {
          headers['X-User-Id'] = authProvider.uid;
        }
        // Also include Authorization token for journey-log
        const token = await authProvider.getIdToken(forceRefresh);
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('[HTTP Client] Failed to get auth credentials:', error);
      // Continue without auth headers - let the server reject if needed
    }
  }

  // Log request in development
  if (config.isDevelopment) {
    console.log('[HTTP Client]', fetchOptions.method || 'GET', url);
  }

  try {
    const response = await fetchWithTimeout(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 Unauthorized with token refresh retry
    if (response.status === 401 && retryCount === 0 && authProvider && !skipAuth) {
      if (config.isDevelopment) {
        console.log('[HTTP Client] Received 401, retrying with refreshed token...');
      }
      // Retry once with force refresh
      return request<T>(endpoint, options, retryCount + 1);
    }

    // Handle non-2xx responses
    if (!response.ok) {
      const error = await transformResponseToError(response);
      logHttpError(error, getServiceType(url) || undefined);
      throw error;
    }

    // Handle empty body for 204 No Content, etc.
    const contentLength = response.headers.get('Content-Length');
    if (response.status === 204 || (contentLength && parseInt(contentLength, 10) === 0)) {
      return undefined as T;
    }

    // Parse JSON response
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }
    const data = JSON.parse(text);

    if (config.isDevelopment) {
      console.log('[HTTP Client] Response:', data);
    }

    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (isApiErrorUtil(error)) {
      throw error;
    }

    // Wrap other errors
    const wrappedError = wrapError(error);
    console.error('[HTTP Client] Network error:', wrappedError);
    throw wrappedError;
  }
}

// Re-export for convenience
export type { ApiError };
export { isApiErrorUtil as isApiError };

/**
 * HTTP Client API
 */
export const httpClient = {
  /**
   * GET request
   */
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PUT request
   */
  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PATCH request
   */
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * DELETE request
   */
  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Service-specific clients with pre-configured base URLs
 */
export const dungeonMasterClient = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    httpClient.get<T>(endpoint, { ...options, baseUrl: config.dungeonMasterApiUrl }),
  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    httpClient.post<T>(endpoint, body, { ...options, baseUrl: config.dungeonMasterApiUrl }),
  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    httpClient.put<T>(endpoint, body, { ...options, baseUrl: config.dungeonMasterApiUrl }),
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    httpClient.patch<T>(endpoint, body, { ...options, baseUrl: config.dungeonMasterApiUrl }),
  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    httpClient.delete<T>(endpoint, { ...options, baseUrl: config.dungeonMasterApiUrl }),
};

export const journeyLogClient = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    httpClient.get<T>(endpoint, { ...options, baseUrl: config.journeyLogApiUrl }),
  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    httpClient.post<T>(endpoint, body, { ...options, baseUrl: config.journeyLogApiUrl }),
  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    httpClient.put<T>(endpoint, body, { ...options, baseUrl: config.journeyLogApiUrl }),
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    httpClient.patch<T>(endpoint, body, { ...options, baseUrl: config.journeyLogApiUrl }),
  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    httpClient.delete<T>(endpoint, { ...options, baseUrl: config.journeyLogApiUrl }),
};
