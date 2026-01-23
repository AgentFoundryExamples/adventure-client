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
 * API Client Configuration
 * Configures and exports OpenAPI-generated clients with auth integration
 */

import { config } from '@/config/env';
import { OpenAPI as DungeonMasterOpenAPI } from './dungeonMaster';
import { OpenAPI as JourneyLogOpenAPI } from './journeyLog';
import type { AuthProvider } from '@/lib/http/client';

/**
 * Configures OpenAPI clients with base URLs and auth token resolvers
 * @param authProvider - Auth provider instance from AuthContext
 */
export function configureApiClients(authProvider: AuthProvider | null): void {
  // Configure Dungeon Master API client
  DungeonMasterOpenAPI.BASE = config.dungeonMasterApiUrl;
  DungeonMasterOpenAPI.TOKEN = authProvider
    ? async () => {
        const token = await authProvider.getIdToken();
        return token || '';
      }
    : undefined;

  // Configure Journey Log API client
  JourneyLogOpenAPI.BASE = config.journeyLogApiUrl;
  JourneyLogOpenAPI.TOKEN = authProvider
    ? async () => {
        const token = await authProvider.getIdToken();
        return token || '';
      }
    : undefined;

  // Set up custom headers for Journey Log (X-User-Id)
  JourneyLogOpenAPI.HEADERS = authProvider
    ? async () => {
        const headers: Record<string, string> = {};
        if (authProvider.uid) {
          headers['X-User-Id'] = authProvider.uid;
        }
        return headers;
      }
    : undefined;
}

// Re-export generated API services for convenience
export { GameService } from './dungeonMaster';
export { CharactersService, DefaultService, OperationsService } from './journeyLog';

// Re-export commonly used types
export type { TurnRequest, TurnResponse } from './dungeonMaster';
export type {
  CreateCharacterRequest,
  CreateCharacterResponse,
  GetCharacterResponse,
  CharacterDocument,
} from './journeyLog';
