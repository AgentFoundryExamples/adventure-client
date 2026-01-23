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
import '@testing-library/jest-dom';

// Mock environment variables for tests
import.meta.env.VITE_DUNGEON_MASTER_API_BASE_URL = 'http://localhost:8000';
import.meta.env.VITE_JOURNEY_LOG_API_BASE_URL = 'http://localhost:8001';
import.meta.env.VITE_FIREBASE_API_KEY = 'test-api-key';
import.meta.env.VITE_FIREBASE_AUTH_DOMAIN = 'test-auth-domain.firebaseapp.com';
import.meta.env.VITE_FIREBASE_PROJECT_ID = 'test-project-id';
import.meta.env.VITE_FIREBASE_STORAGE_BUCKET = 'test-bucket.appspot.com';
import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID = '123456789';
import.meta.env.VITE_FIREBASE_APP_ID = 'test-app-id';
import.meta.env.VITE_FIREBASE_MEASUREMENT_ID = 'test-measurement-id';
