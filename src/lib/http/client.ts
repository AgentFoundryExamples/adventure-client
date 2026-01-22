/**
 * HTTP Client Utility
 * Centralized HTTP client using fetch API with JSON helpers and error handling
 */

import { config } from '@/config/env';

/**
 * Standard API error response structure
 */
export interface ApiError {
  message: string;
  status: number;
  statusText: string;
  data?: unknown;
}

/**
 * HTTP request options
 */
export interface RequestOptions extends RequestInit {
  baseUrl?: string;
  timeout?: number;
}

/**
 * Creates a structured API error
 */
function createApiError(
  message: string,
  status: number,
  statusText: string,
  data?: unknown
): ApiError {
  return { message, status, statusText, data };
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
      throw createApiError(
        'Request timeout',
        408,
        'Request Timeout',
        { timeout }
      );
    }
    throw error;
  }
}

/**
 * Base HTTP request handler
 * @throws ApiError for non-2xx responses
 */
async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { baseUrl, ...fetchOptions } = options;
  
  // Build full URL
  const url = baseUrl
    ? `${baseUrl}${endpoint}`
    : endpoint.startsWith('http')
    ? endpoint
    : `${config.dungeonMasterApiUrl}${endpoint}`;
  
  // TODO: Add auth headers when Firebase is integrated
  // const authToken = getAuthToken();
  // if (authToken) {
  //   headers.Authorization = `Bearer ${authToken}`;
  // }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };
  
  // Log request in development
  if (config.isDevelopment) {
    console.log('[HTTP Client]', fetchOptions.method || 'GET', url);
  }
  
  try {
    const response = await fetchWithTimeout(url, {
      ...fetchOptions,
      headers,
    });
    
    // Handle non-2xx responses
    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      
      const error = createApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response.statusText,
        errorData
      );
      
      // TODO: Add centralized error logging/tracking
      console.error('[HTTP Client] Request failed:', error);
      
      throw error;
    }
    
    // Parse JSON response
    const data = await response.json();
    
    if (config.isDevelopment) {
      console.log('[HTTP Client] Response:', data);
    }
    
    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if ((error as ApiError).status !== undefined) {
      throw error;
    }
    
    // Wrap other errors
    console.error('[HTTP Client] Network error:', error);
    throw createApiError(
      'Network request failed',
      0,
      'Network Error',
      { originalError: (error as Error).message }
    );
  }
}

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
