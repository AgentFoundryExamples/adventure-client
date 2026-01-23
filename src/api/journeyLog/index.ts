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
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export { ApiError } from './core/ApiError';
export { CancelablePromise, CancelError } from './core/CancelablePromise';
export { OpenAPI } from './core/OpenAPI';
export type { OpenAPIConfig } from './core/OpenAPI';

export type { AppendNarrativeRequest } from './models/AppendNarrativeRequest';
export type { AppendNarrativeResponse } from './models/AppendNarrativeResponse';
export type { CharacterContextResponse } from './models/CharacterContextResponse';
export type { CharacterDocument } from './models/CharacterDocument';
export type { CharacterIdentity } from './models/CharacterIdentity';
export type { CharacterMetadata } from './models/CharacterMetadata';
export type { CleanupResponse } from './models/CleanupResponse';
export type { CombatEnvelope } from './models/CombatEnvelope';
export type { CombatState_Input } from './models/CombatState_Input';
export type { CombatState_Output } from './models/CombatState_Output';
export type { ContextCapsMetadata } from './models/ContextCapsMetadata';
export type { CreateCharacterRequest } from './models/CreateCharacterRequest';
export type { CreateCharacterResponse } from './models/CreateCharacterResponse';
export type { CreatePOIRequest } from './models/CreatePOIRequest';
export type { CreatePOIResponse } from './models/CreatePOIResponse';
export type { EnemyState } from './models/EnemyState';
export type { ErrorResponse } from './models/ErrorResponse';
export type { FirestoreTestResponse } from './models/FirestoreTestResponse';
export type { GetCharacterResponse } from './models/GetCharacterResponse';
export type { GetCombatResponse } from './models/GetCombatResponse';
export type { GetNarrativeResponse } from './models/GetNarrativeResponse';
export type { GetPOIsResponse } from './models/GetPOIsResponse';
export type { GetPOISummaryResponse } from './models/GetPOISummaryResponse';
export type { GetQuestResponse } from './models/GetQuestResponse';
export type { GetRandomPOIsResponse } from './models/GetRandomPOIsResponse';
export type { HTTPValidationError } from './models/HTTPValidationError';
export type { InventoryItem } from './models/InventoryItem';
export type { ListCharactersResponse } from './models/ListCharactersResponse';
export type { Location } from './models/Location';
export type { NarrativeContext } from './models/NarrativeContext';
export type { NarrativeMetadata } from './models/NarrativeMetadata';
export type { NarrativeTurn } from './models/NarrativeTurn';
export type { PlayerState } from './models/PlayerState';
export type { PointOfInterest } from './models/PointOfInterest';
export type { Quest } from './models/Quest';
export type { QuestArchiveEntry } from './models/QuestArchiveEntry';
export type { QuestRewards } from './models/QuestRewards';
export type { SetQuestResponse } from './models/SetQuestResponse';
export type { Status } from './models/Status';
export type { UpdateCombatRequest } from './models/UpdateCombatRequest';
export type { UpdateCombatResponse } from './models/UpdateCombatResponse';
export type { UpdatePOIRequest } from './models/UpdatePOIRequest';
export type { UpdatePOIResponse } from './models/UpdatePOIResponse';
export type { ValidationError } from './models/ValidationError';
export type { Weapon } from './models/Weapon';
export type { WorldContextState } from './models/WorldContextState';

export { CharactersService } from './services/CharactersService';
export { DefaultService } from './services/DefaultService';
export { OperationsService } from './services/OperationsService';
