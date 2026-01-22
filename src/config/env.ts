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
 * Environment configuration module
 * Provides typed access to environment variables with validation
 */

interface EnvConfig {
  dungeonMasterApiUrl: string;
  journeyLogApiUrl: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Validates that a required environment variable exists
 * @throws Error if the variable is missing or empty
 */
function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please ensure ${key} is set in your .env file or environment.\n` +
      `See .env.example for required variables.`
    );
  }
  return value;
}

/**
 * Gets an optional environment variable with a fallback value
 */
function getOptionalEnv(key: string, fallback: string): string {
  return import.meta.env[key] || fallback;
}

/**
 * Loads and validates environment configuration
 * @throws Error if any required variables are missing
 */
function loadConfig(): EnvConfig {
  const mode = import.meta.env.MODE || 'development';
  
  return {
    dungeonMasterApiUrl: getRequiredEnv('VITE_DUNGEON_MASTER_API_BASE_URL'),
    journeyLogApiUrl: getRequiredEnv('VITE_JOURNEY_LOG_API_BASE_URL'),
    firebase: {
      apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
      authDomain: getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
      projectId: getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
      storageBucket: getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getRequiredEnv('VITE_FIREBASE_APP_ID'),
      measurementId: getOptionalEnv('VITE_FIREBASE_MEASUREMENT_ID', ''),
    },
    isDevelopment: mode === 'development',
    isProduction: mode === 'production',
  };
}

// Export singleton config instance
// This will fail fast at module load time if required variables are missing
export const config = loadConfig();

// Export type for consumers
export type { EnvConfig };
