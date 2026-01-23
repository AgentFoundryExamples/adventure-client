/**
 * Shared Test Utilities and Mocks
 * Provides reusable mocks for common testing scenarios across the application
 */

import { vi } from 'vitest';
import type { User as FirebaseUser } from 'firebase/auth';
import type { ApiError } from '@/lib/http/errors';

/**
 * Creates a mock Firebase user with optional overrides
 */
export function createMockFirebaseUser(overrides?: Partial<FirebaseUser>): Partial<FirebaseUser> {
  const mockGetIdToken = vi.fn().mockResolvedValue('mock-token-123');
  
  return {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: '2025-01-01T00:00:00.000Z',
      lastSignInTime: '2025-01-15T12:00:00.000Z',
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: mockGetIdToken,
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    ...overrides,
  };
}

/**
 * Creates a mock API error with specified status code and message
 */
export function createMockApiError(
  status: number,
  message?: string,
  data?: unknown
): ApiError & Error {
  const statusText = getStatusText(status);
  const errorMessage = message || `HTTP ${status}: ${statusText}`;
  
  const error = new Error(errorMessage) as ApiError & Error;
  error.status = status;
  error.statusText = statusText;
  error.message = errorMessage;
  error.data = data;
  
  return error;
}

/**
 * Maps HTTP status codes to standard status text
 */
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    408: 'Request Timeout',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };
  
  return statusTexts[status] || 'Unknown Error';
}

/**
 * Creates a mock navigation state with flash message
 */
export interface MockFlashMessage {
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export function createMockFlashMessage(
  message: string,
  severity: 'error' | 'warning' | 'info' = 'info'
): MockFlashMessage {
  return { message, severity };
}

/**
 * HTTP Status Code Constants for Tests
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Common error messages for different HTTP status codes
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication failed. Please log in again.',
  FORBIDDEN: "Access denied. You don't have permission to access this resource.",
  NOT_FOUND: 'Resource not found. It may have been moved or deleted.',
  TIMEOUT: 'Request timeout. Please check your connection and try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment before trying again.',
  SERVER_ERROR: 'Server error. Please try again later or contact support.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
} as const;

/**
 * Mock config for environment variables
 */
export const mockConfig = {
  dungeonMasterApiUrl: 'http://localhost:8000',
  journeyLogApiUrl: 'http://localhost:8001',
  firebase: {
    apiKey: 'test-api-key',
    authDomain: 'test-auth-domain.firebaseapp.com',
    projectId: 'test-project-id',
    storageBucket: 'test-bucket.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
    measurementId: 'test-measurement-id',
  },
  isDevelopment: true,
  isProduction: false,
};

/**
 * Creates a promise that can be resolved/rejected manually
 * Useful for testing loading states and race conditions
 */
export function createControllablePromise<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  
  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}

/**
 * Wait for a specified number of milliseconds
 * Useful for testing timing-dependent behavior
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock Firebase Auth state change handler setup
 */
export function setupMockAuthStateHandler() {
  const unsubscribe = vi.fn();
  const mockOnAuthStateChanged = vi.fn();
  
  mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
    // Immediately call with null user (signed out state)
    callback(null);
    return unsubscribe;
  });
  
  return {
    mockOnAuthStateChanged,
    unsubscribe,
    // Helper to emit auth state changes
    emitAuthState: (user: Partial<FirebaseUser> | null) => {
      const callback = mockOnAuthStateChanged.mock.calls[0]?.[1];
      if (callback) {
        callback(user);
      }
    },
  };
}

/**
 * Transient error codes that should trigger retry logic
 */
export const TRANSIENT_ERROR_CODES = [
  HTTP_STATUS.REQUEST_TIMEOUT,
  HTTP_STATUS.TOO_MANY_REQUESTS,
  HTTP_STATUS.INTERNAL_SERVER_ERROR,
  HTTP_STATUS.BAD_GATEWAY,
  HTTP_STATUS.SERVICE_UNAVAILABLE,
  HTTP_STATUS.GATEWAY_TIMEOUT,
];

/**
 * Checks if an HTTP status code represents a transient error
 */
export function isTransientError(status: number): boolean {
  return TRANSIENT_ERROR_CODES.includes(status);
}
