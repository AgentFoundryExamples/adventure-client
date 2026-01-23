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
 * Provides lazy-initialized singleton Firebase app and auth instances configured from environment variables
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { config } from '../config/env';

// Cache for lazy-initialized instances
let _firebaseApp: FirebaseApp | null = null;
let _auth: Auth | null = null;

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

  try {
    // Validate that we have the required configuration
    if (
      !config.firebase.apiKey ||
      !config.firebase.projectId ||
      !config.firebase.authDomain ||
      !config.firebase.appId
    ) {
      throw new Error(
        'Firebase configuration is incomplete. ' +
          'Ensure VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_APP_ID are set.'
      );
    }

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
      console.info('✅ Firebase initialized successfully:', {
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
        'Please check your Firebase configuration in your environment variables.'
    );
  }
}

/**
 * Gets the singleton Firebase app instance.
 * Lazily initializes on first access with configuration from environment variables.
 * 
 * @returns Initialized Firebase app instance
 * @throws Error if Firebase configuration is invalid or incomplete
 * 
 * @example
 * import { getFirebaseApp } from '@/lib/firebase';
 * const app = getFirebaseApp();
 */
export function getFirebaseApp(): FirebaseApp {
  if (!_firebaseApp) {
    _firebaseApp = initializeFirebaseApp();
  }
  return _firebaseApp;
}

/**
 * Gets the singleton Firebase Auth instance.
 * Lazily initializes on first access.
 * 
 * @returns Configured Firebase Auth instance
 * @throws Error if Firebase configuration is invalid or incomplete
 * 
 * @example
 * import { getFirebaseAuth } from '@/lib/firebase';
 * import { signInWithEmailAndPassword } from 'firebase/auth';
 * const auth = getFirebaseAuth();
 * await signInWithEmailAndPassword(auth, email, password);
 */
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

// Convenience exports that maintain backward compatibility
// Note: These will still initialize immediately on module import
// For true lazy initialization, use getFirebaseApp() and getFirebaseAuth() instead

/**
 * Singleton Firebase app instance.
 * @deprecated This initializes Firebase immediately on import. Use getFirebaseApp() for lazy initialization.
 */
export const firebaseApp = getFirebaseApp();

/**
 * Singleton Firebase Auth instance.
 * @deprecated This initializes Firebase immediately on import. Use getFirebaseAuth() for lazy initialization.
 */
export const auth = getFirebaseAuth();
