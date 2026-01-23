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
 * Authentication types
 */

import type { User as FirebaseUser } from 'firebase/auth';

export interface AuthError {
  message: string;
  code?: string;
  reason?: 'token-refresh-failed' | 'token-expired' | 'no-user' | 'firebase-error' | 'network-error';
}

export interface AuthState {
  user: FirebaseUser | null;
  uid: string | null;
  loading: boolean;
  error: AuthError | null;
}

export interface AuthContextValue extends AuthState {
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  signInWithGoogle?: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}
