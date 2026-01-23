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
 * Firebase initialization module
 * Provides singleton Firebase app and auth instances configured from environment variables
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { config } from '../config/env';

/**
 * Initializes Firebase app with configuration from environment variables.
 * This function is singleton-safe - it will only initialize once even if called multiple times.
 * This prevents issues with hot module reloads during development.
 *
 * @returns Initialized Firebase app instance
 * @throws Error if Firebase configuration is invalid or incomplete
 */
function initializeFirebaseApp(): FirebaseApp {
  // Check if Firebase is already initialized (singleton pattern)
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // Validate that we have the required configuration
  if (!config.firebase.apiKey || !config.firebase.projectId) {
    throw new Error(
      'Firebase configuration is incomplete. ' +
        'Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID are set. ' +
        'See .env.example for all required Firebase variables.'
    );
  }

  try {
    // Initialize Firebase with configuration from env
    const app = initializeApp({
      apiKey: config.firebase.apiKey,
      authDomain: config.firebase.authDomain,
      projectId: config.firebase.projectId,
      storageBucket: config.firebase.storageBucket,
      messagingSenderId: config.firebase.messagingSenderId,
      appId: config.firebase.appId,
      measurementId: config.firebase.measurementId || undefined,
    });

    if (config.isDevelopment) {
      console.log('✅ Firebase initialized successfully:', {
        projectId: config.firebase.projectId,
        authDomain: config.firebase.authDomain,
      });
    }

    return app;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to initialize Firebase: ${errorMessage}\n` +
        'Please check your Firebase configuration in .env file.'
    );
  }
}

/**
 * Singleton Firebase app instance.
 * Initialized once at module load time with configuration from environment variables.
 */
export const firebaseApp = initializeFirebaseApp();

/**
 * Singleton Firebase Auth instance.
 * Configured to use the initialized Firebase app.
 */
export const auth = getAuth(firebaseApp);
