# Character Creation API Documentation

## Overview

This document describes the character creation workflow across the Dungeon Master and Journey Log services. Character creation is a two-step process that involves both services working together to create a complete character with an initial narrative.

## Dungeon Master Character Creation Endpoint

### HTTP Method and Path

```
POST /characters
```

Base URL: Configured via `config.dungeonMasterApiUrl` (typically points to the dungeon-master service)

### Authentication Requirements

**Required Headers:**

1. **Authorization** (Bearer Token)
   - Format: `Bearer <firebase-id-token>`
   - The Firebase ID token must be obtained from the authenticated user
   - Configured automatically via `DungeonMasterOpenAPI.TOKEN` when using the generated API client
   - The token is used to identify and authenticate the user making the request

2. **X-Dev-User-Id** (Optional, for development)
   - Format: `X-Dev-User-Id: <user-id-string>`
   - Used in development/testing environments to override the user ID from the token
   - Not required in production environments
   - Can be `null` or omitted

### Request Model: CharacterCreationRequest

**TypeScript Interface:**

```typescript
export type CharacterCreationRequest = {
  /**
   * Character name
   */
  name: string;
  
  /**
   * Character race
   */
  race: string;
  
  /**
   * Character class
   */
  class_name: string;
  
  /**
   * Optional prompt to customize the world setting or opening scene
   */
  custom_prompt?: (string | null);
};
```

**Field Specifications:**

| Field | Type | Required | Constraints | Description | Example |
|-------|------|----------|-------------|-------------|---------|
| `name` | string | ✅ Yes | 1-100 characters | Character's name | "Aelthor", "Grom" |
| `race` | string | ✅ Yes | 1-50 characters | Character's race | "Human", "Elf", "Dwarf" |
| `class_name` | string | ✅ Yes | 1-50 characters | Character's class | "Warrior", "Rogue", "Wizard" |
| `custom_prompt` | string \| null | ❌ No | 0-2000 characters | Optional world/setting customization | "A dark fantasy world where the sun has vanished." |

**Note:** The field is named `class_name` (not `class`) to avoid conflicts with JavaScript/TypeScript reserved keywords.

**Character Limits & Constraints:**

The backend enforces strict validation on all character creation fields:

| Limit Type | Value | Enforced By | User Impact |
|------------|-------|-------------|-------------|
| **Name Length** | 1-100 chars | Backend validation | 422 error if exceeded; UI should show character counter |
| **Race Length** | 1-50 chars | Backend validation | 422 error if exceeded; recommend dropdown with predefined options |
| **Class Length** | 1-50 chars | Backend validation | 422 error if exceeded; recommend dropdown with predefined options |
| **Custom Prompt** | 0-2000 chars | Backend validation | 422 error if exceeded; UI should show character counter |
| **Empty Fields** | Not allowed | Backend validation | 422 error; all required fields must have non-empty values |

**Validation Error Example:**

If constraints are violated, the API returns 422 with detailed error information:

```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "ensure this value has at most 100 characters",
      "type": "value_error.any_str.max_length"
    }
  ]
}
```

**UI Recommendations:**

- Show character counters for `name` and `custom_prompt` fields
- Disable submit button when limits are exceeded
- Provide predefined dropdown lists for `race` and `class_name` to prevent typos
- Display validation errors inline below each field
- Example races: Human, Elf, Dwarf, Orc, Halfling, Gnome, Tiefling
- Example classes: Warrior, Rogue, Wizard, Cleric, Ranger, Paladin, Bard

### Response Model: CharacterCreationResponse

**TypeScript Interface:**

```typescript
export type CharacterCreationResponse = {
  /**
   * UUID of the created character
   */
  character_id: string;
  
  /**
   * Introductory narrative scene
   */
  narrative: string;
};
```

**Field Specifications:**

| Field | Type | Description |
|-------|------|-------------|
| `character_id` | string | UUID of the newly created character. This ID is used for all subsequent operations involving this character. |
| `narrative` | string | The AI-generated introductory narrative scene that sets the stage for the character's adventure. This is the first "turn" in the game. |

**Response Status Codes:**

- `201 Created` - Character successfully created with narrative
- `422 Unprocessable Entity` - Validation error (missing required fields, invalid values, constraints violated)

### Example Usage

#### Using the Generated GameService Client

```typescript
import { GameService } from '@/api/dungeonMaster';
import type { CharacterCreationRequest, CharacterCreationResponse } from '@/api/dungeonMaster';

// The API client is automatically configured with auth tokens
// when you call configureApiClients(authProvider) from @/api

const request: CharacterCreationRequest = {
  name: "Thorin Ironforge",
  race: "Dwarf",
  class_name: "Warrior",
  custom_prompt: "A world of underground kingdoms carved from living stone"
};

try {
  const response: CharacterCreationResponse = await GameService.createCharacterCharactersPost({
    requestBody: request,
    xDevUserId: null // Optional, typically null in production
  });
  
  console.log(`Character created with ID: ${response.character_id}`);
  console.log(`Opening narrative: ${response.narrative}`);
} catch (error) {
  console.error('Failed to create character:', error);
}
```

#### Raw HTTP Request Example

```bash
curl -X POST https://dungeon-master-api.example.com/characters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase-id-token>" \
  -d '{
    "name": "Thorin Ironforge",
    "race": "Dwarf",
    "class_name": "Warrior",
    "custom_prompt": "A world of underground kingdoms carved from living stone"
  }'
```

**Response:**

```json
{
  "character_id": "123e4567-e89b-12d3-a456-426614174000",
  "narrative": "You stand at the entrance of the great underground fortress of Khaz-Modan..."
}
```

## Relationship with Journey Log Service

### Does Dungeon Master Write to Journey Log?

**Yes, the dungeon-master service automatically handles journey-log writes during character creation.**

When you call the dungeon-master `/characters` endpoint, the following happens behind the scenes:

1. **Dungeon Master Service:**
   - Generates the AI narrative for the character's opening scene
   - Creates a character entry with the basic details

2. **Journey Log Service (Automatic):**
   - The dungeon-master service orchestrates a call to journey-log
   - Journey-log creates the character document in Firestore with full state
   - Journey-log persists the initial narrative turn

### Journey Log Character Creation Endpoint (For Reference)

While dungeon-master handles this automatically, it's useful to understand the underlying journey-log contract:

**Endpoint:** `POST /characters`

**Headers:**
- `X-User-Id`: User identifier (required for ownership)
- `Authorization`: Bearer token

**Request Model (journey-log):**

```typescript
{
  name: string;           // 1-64 characters
  race: string;           // 1-64 characters
  class: string;          // 1-64 characters (note: "class" not "class_name")
  adventure_prompt: string;  // Non-empty string
  location_id?: string | null;  // Optional, defaults to "origin:nexus"
  location_display_name?: string | null;  // Optional
}
```

**Key Differences Between Dungeon Master and Journey Log:**

| Aspect | Dungeon Master | Journey Log |
|--------|----------------|-------------|
| Field name for class | `class_name` | `class` |
| Custom text field | `custom_prompt` (optional) | `adventure_prompt` (required) |
| Response | `{ character_id, narrative }` | `{ character }` (full document) |
| Purpose | AI narrative generation | State persistence |
| Location | Not included | Optional `location_id` and `location_display_name` |

### Important: Do NOT Call Journey Log Directly After Dungeon Master

**⚠️ Warning:** Do not manually call the journey-log `/characters` endpoint after calling dungeon-master's `/characters` endpoint. This will result in:

- Duplicate character records
- Inconsistent state between services
- Potential data conflicts

**Correct Flow:**

```
1. User submits character creation form
2. Frontend calls: POST /characters (dungeon-master)
3. Dungeon-master internally calls journey-log (automatic)
4. Frontend receives: { character_id, narrative }
5. Frontend uses character_id for all subsequent operations
```

### Retrieving Character Data After Creation

After character creation, you can retrieve the full character state from journey-log:

```typescript
import { CharactersService } from '@/api/journeyLog';

// Get full character document
const character = await CharactersService.getCharacterCharactersCharacterIdGet({
  characterId: response.character_id,
  xUserId: userId
});

// Get the initial narrative turn
const lastTurn = await CharactersService.getNarrativeTurnsCharactersCharacterIdNarrativeGet({
  characterId: response.character_id,
  n: 1,
  xUserId: userId
});
```

## Error Handling

### Common Errors

**422 Validation Error**

```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Causes:**
- Missing required fields (`name`, `race`, `class_name`)
- Field length constraints violated
- Invalid field values

**401 Unauthorized**

**Causes:**
- Missing or invalid Firebase ID token
- Expired authentication token
- Token verification failed

**500 Internal Server Error**

**Causes:**
- LLM API failure (OpenAI service unavailable)
- Journey-log service unavailable
- Internal service errors

### Error Handling Example

```typescript
import { ApiError } from '@/api/dungeonMaster';

try {
  const response = await GameService.createCharacterCharactersPost({
    requestBody: request,
    xDevUserId: null
  });
  // Success handling
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        console.error('Authentication required. Please log in.');
        break;
      case 422:
        console.error('Invalid character data:', error.body);
        break;
      case 500:
        console.error('Server error. Please try again later.');
        break;
      default:
        console.error('Unexpected error:', error);
    }
  } else {
    console.error('Network or unknown error:', error);
  }
}
```

## Implementation Notes

### Field Naming Convention

The dungeon-master API uses `class_name` instead of `class` to:
- Avoid conflicts with JavaScript/TypeScript reserved keywords
- Maintain clarity in code that uses the API
- Prevent potential issues with code generators and minifiers

### Custom Prompt vs Adventure Prompt

- **Dungeon Master** (`custom_prompt`): Optional field that allows players to shape the world/setting
- **Journey Log** (`adventure_prompt`): Required field for internal state tracking
- The dungeon-master service automatically maps `custom_prompt` to `adventure_prompt` when calling journey-log
- If `custom_prompt` is not provided, dungeon-master generates a default prompt internally

### Narrative Generation

The `narrative` field in the response is generated by:
1. OpenAI GPT API (configured in dungeon-master service)
2. Using the character details and custom prompt as context
3. Following the dungeon master persona and game rules
4. Generating an engaging opening scene

This is the **first turn** of the game and serves as the initial scenario for the player.

## Testing and Development

### Development Headers

When testing locally or in development environments, you can use the `X-Dev-User-Id` header:

```typescript
const response = await GameService.createCharacterCharactersPost({
  requestBody: request,
  xDevUserId: "dev-user-123" // Override user ID for testing
});
```

This bypasses normal authentication checks and uses the provided user ID.

⚠️ **CRITICAL SECURITY WARNING:** The `X-Dev-User-Id` header MUST be disabled in production environments. This header bypasses authentication and allows arbitrary user impersonation, which is a serious security vulnerability. Ensure your backend service:
- Only accepts this header when running in development mode (e.g., `ENABLE_DEV_MODE=true`)
- Completely ignores this header in production deployments
- Logs any attempts to use this header in production for security monitoring

Never deploy to production with development authentication bypass features enabled.

## Related Documentation

- **Firebase Setup:** See `docs/firebase-setup.md` for authentication configuration
- **Journey Log API:** See `journey-log.openapi.json` for complete journey-log API reference
- **Dungeon Master API:** See `dungeon-master.openapi.json` for complete dungeon-master API reference
- **Turn Processing:** See the `/turn` endpoint documentation for handling subsequent player actions

## API Client Configuration

The OpenAPI-generated clients are configured automatically when you initialize the auth provider:

```typescript
import { configureApiClients } from '@/api';
import { authProvider } from '@/lib/auth';

// Configure both dungeon-master and journey-log clients
configureApiClients(authProvider);

// Now all API calls will automatically include:
// - Authorization: Bearer <token> header
// - X-User-Id header (for journey-log)
```

See `src/api/index.ts` for the implementation details.

## Summary Checklist

When implementing character creation in your UI:

- ✅ Collect `name`, `race`, `class_name` from user (all required)
- ✅ Optionally collect `custom_prompt` for world customization
- ✅ Ensure user is authenticated (Firebase auth)
- ✅ Call `GameService.createCharacterCharactersPost()` with request data
- ✅ Handle the response containing `character_id` and `narrative`
- ✅ Display the narrative to the user as the opening scene
- ✅ Store `character_id` for subsequent turn submissions
- ❌ **DO NOT** manually call journey-log `/characters` after dungeon-master creation
- ✅ Use `character_id` to fetch full character state if needed via journey-log
- ✅ Handle errors gracefully (validation, auth, server errors)

## Version Information

- **API Specification:** OpenAPI 3.1.0
- **Dungeon Master Service:** See `dungeon-master.openapi.json` for version
- **Journey Log Service:** See `journey-log.openapi.json` for version
- **Frontend TypeScript Models:** Auto-generated from OpenAPI specs
