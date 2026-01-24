# Dependency Graph

Multi-language intra-repository dependency analysis.

Supports Python, JavaScript/TypeScript, C/C++, Rust, Go, Java, C#, Swift, HTML/CSS, and SQL.

Includes classification of external dependencies as stdlib vs third-party.

## Statistics

- **Total files**: 137
- **Intra-repo dependencies**: 148
- **External stdlib dependencies**: 1
- **External third-party dependencies**: 42

## External Dependencies

### Standard Library / Core Modules

Total: 1 unique modules

- `path`

### Third-Party Packages

Total: 42 unique packages

- `@/api`
- `@/api/journeyLog`
- `@/components`
- `@/components/AccountMenu`
- `@/components/ProtectedRoute`
- `@/config/env`
- `@/context/AuthContext`
- `@/hooks/useAuth`
- `@/layouts/AppLayout`
- `@/lib/firebase`
- `@/lib/http/client`
- `@/lib/http/errors`
- `@/pages/AppPage`
- `@/pages/CharacterCreationPage`
- `@/pages/ComponentDemoPage`
- `@/pages/DebugPage`
- `@/pages/GamePage`
- `@/pages/HomePage`
- `@/pages/LoginPage`
- `@/pages/NewCharacterPage`
- ... and 22 more (see JSON for full list)

## Most Depended Upon Files (Intra-Repo)

- `src/api/journeyLog/models/PointOfInterest.ts` (7 dependents)
- `src/api/journeyLog/models/Quest.ts` (6 dependents)
- `src/api/journeyLog/core/OpenAPI.ts` (5 dependents)
- `src/api/journeyLog/core/CancelablePromise.ts` (4 dependents)
- `src/api/journeyLog/models/CombatState_Output.ts` (4 dependents)
- `src/api/dungeonMaster/index.ts` (3 dependents)
- `src/api/dungeonMaster/core/ApiRequestOptions.ts` (3 dependents)
- `src/api/journeyLog/core/ApiRequestOptions.ts` (3 dependents)
- `src/api/journeyLog/models/NarrativeTurn.ts` (3 dependents)
- `src/api/journeyLog/models/Status.ts` (3 dependents)

## Files with Most Dependencies (Intra-Repo)

- `src/api/journeyLog/services/CharactersService.ts` (24 dependencies)
- `src/api/dungeonMaster/services/GameService.ts` (14 dependencies)
- `src/api/journeyLog/models/CharacterContextResponse.ts` (6 dependencies)
- `src/api/dungeonMaster/core/request.ts` (5 dependencies)
- `src/api/dungeonMaster/models/IntentsBlock.ts` (5 dependencies)
- `src/api/journeyLog/core/request.ts` (5 dependencies)
- `src/api/journeyLog/models/CharacterDocument.ts` (5 dependencies)
- `src/api/journeyLog/models/PlayerState.ts` (5 dependencies)
- `src/api/journeyLog/services/OperationsService.ts` (5 dependencies)
- `src/api/__tests__/index.test.ts` (4 dependencies)
