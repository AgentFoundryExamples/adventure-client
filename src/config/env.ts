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
 * 
 * This module serves as the single source of truth for all environment variables
 * consumed by the application. It provides typed access with fail-fast validation.
 * 
 * ## How Vite Environment Variables Work
 * 
 * Vite exposes environment variables prefixed with `VITE_` to the client-side code
 * via `import.meta.env`. These variables are **baked into the JavaScript bundle at
 * build time** (not runtime), which means:
 * 
 * 1. Variables are read during `npm run build` and embedded in static assets
 * 2. Changing variables requires rebuilding and redeploying the application
 * 3. All `VITE_*` variables are visible in the client bundle (never store secrets)
 * 4. Cloud Run runtime environment variables DO NOT work for `VITE_*` variables
 * 
 * ## Environment File Loading
 * 
 * Vite automatically loads environment files based on the build mode:
 * 
 * - **Development** (`npm run dev`):
 *   - Loads `.env.development` (committed, contains mock/safe values)
 *   - Can be overridden by `.env.local` (gitignored, for real credentials)
 * 
 * - **Production** (`npm run build`):
 *   - Loads `.env.production` (committed, contains placeholders)
 *   - Should be overridden by Docker `--build-arg` flags (highest priority)
 * 
 * ## Configuration Verification
 * 
 * ### Development
 * To verify loaded configuration in development, use browser console:
 * ```javascript
 * import('/src/config/env.ts').then(m => console.log('Config:', m.config))
 * ```
 * 
 * ### Production
 * After deployment, inspect the bundle to verify configuration was baked correctly:
 * ```bash
 * curl -s https://your-app.run.app/assets/index-*.js | grep "your-firebase-project-id"
 * ```
 * 
 * ## Required Environment Variables
 * 
 * All variables defined in the `EnvConfig` interface below are REQUIRED unless
 * explicitly marked as optional. Missing required variables will cause the application
 * to fail at startup with a descriptive error message.
 * 
 * See `.env.example` for complete documentation of each variable.
 * 
 * @module config/env
 */

/**
 * Application configuration structure
 * 
 * This interface defines the contract for environment configuration consumed
 * throughout the application. All components should import and use the `config`
 * singleton exported from this module rather than accessing `import.meta.env` directly.
 */
interface EnvConfig {
  /** 
   * Dungeon Master API base URL
   * Development: http://localhost:8001
   * Production: https://dungeon-master-api-xxx.run.app
   */
  dungeonMasterApiUrl: string;
  
  /** 
   * Journey Log API base URL
   * Development: http://localhost:8002
   * Production: https://journey-log-api-xxx.run.app
   */
  journeyLogApiUrl: string;
  
  /** Firebase SDK configuration */
  firebase: {
    /** 
     * Firebase API key (safe to expose publicly, access controlled by Security Rules)
     * Get from: Firebase Console > Project Settings > General > Your apps
     */
    apiKey: string;
    
    /** 
     * Firebase authentication domain for OAuth redirects
     * Format: your-project-id.firebaseapp.com
     */
    authDomain: string;
    
    /** 
     * Firebase project identifier
     * Use separate projects for development, staging, and production
     */
    projectId: string;
    
    /** 
     * Firebase Cloud Storage bucket
     * Format: your-project-id.appspot.com
     */
    storageBucket: string;
    
    /** 
     * Firebase Cloud Messaging sender ID
     * Get from: Firebase Console > Project Settings > Cloud Messaging
     */
    messagingSenderId: string;
    
    /** 
     * Firebase app registration ID
     * Format: 1:123456789012:web:abcdef1234567890
     */
    appId: string;
    
    /** 
     * Google Analytics measurement ID (optional)
     * Format: G-XXXXXXXXXX
     * Only required if using Google Analytics with Firebase
     */
    measurementId: string;
  };
  
  /** True if running in development mode (npm run dev) */
  isDevelopment: boolean;
  
  /** True if running in production mode (npm run build) */
  isProduction: boolean;
}

/**
 * Validates that a required environment variable exists and is non-empty
 * 
 * @param key - Environment variable name (with VITE_ prefix)
 * @returns The environment variable value
 * @throws {Error} If the variable is missing or empty, with guidance on how to fix
 * 
 * @example
 * ```typescript
 * const apiKey = getRequiredEnv('VITE_FIREBASE_API_KEY');
 * // Throws if VITE_FIREBASE_API_KEY is undefined or empty string
 * ```
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
 * 
 * Use this for variables that are not critical for application startup,
 * such as analytics IDs or feature flags.
 * 
 * @param key - Environment variable name (with VITE_ prefix)
 * @param fallback - Default value to use if variable is not set
 * @returns The environment variable value or fallback
 * 
 * @example
 * ```typescript
 * const analyticsId = getOptionalEnv('VITE_FIREBASE_MEASUREMENT_ID', '');
 * // Returns empty string if not set, doesn't throw
 * ```
 */
function getOptionalEnv(key: string, fallback: string): string {
  return import.meta.env[key] || fallback;
}

/**
 * Loads and validates environment configuration
 * 
 * This function is called once at module load time to create the singleton
 * configuration object. It will throw an error and prevent application startup
 * if any required variables are missing.
 * 
 * @returns Validated and structured configuration object
 * @throws {Error} If any required variables are missing
 * 
 * @internal This function is not exported; consumers should use the `config` singleton
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
// 
// Usage in application code:
// ```typescript
// import { config } from '@/config/env';
// 
// // Access configuration values (type-safe)
// const apiUrl = config.dungeonMasterApiUrl;
// const firebaseConfig = config.firebase;
// ```
export const config = loadConfig();

// Export type for consumers who need to reference the configuration structure
export type { EnvConfig };
