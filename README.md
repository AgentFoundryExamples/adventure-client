# Adventure Client

A React-based web client for the Adventure Game platform, built with TypeScript and Vite.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Docker Deployment](#docker-deployment)
- [Cloud Run Deployment](#cloud-run-deployment)
- [Project Structure](#project-structure)
- [Architecture](#architecture)

## Prerequisites

- **Node.js**: 24.x (Active LTS 'Krypton') or 25.x (Current) - see `ts_dev_versions.txt`
- **Package Manager**: npm (included with Node.js) or pnpm (preferred)
- **Docker**: Required for containerized deployment (optional for local development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adventure-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   Or with pnpm (recommended for faster installs):
   ```bash
   pnpm install
   ```

## Configuration

The application uses environment variables for configuration. Different configurations are needed for development and production.

### Development Configuration

For local development, copy the development template:

```bash
cp .env.development .env.local
```

The `.env.development` file includes mock values for local development:
- API endpoints point to localhost (ports 8001, 8002)
- Firebase configuration uses mock/test values

Edit `.env.local` to match your local setup if needed.

### Production Configuration

For production deployments, environment variables should be:
- Built into the application during the Docker build process
- Set via CI/CD pipelines or Cloud Run environment configuration

**Important**: Since Vite bundles environment variables at build time (not runtime), production values must be available during the `npm run build` step.

#### Environment Variables Reference

| Variable | Description | Example (Development) |
|----------|-------------|----------------------|
| `VITE_DUNGEON_MASTER_API_BASE_URL` | Dungeon Master API endpoint | `http://localhost:8001` |
| `VITE_JOURNEY_LOG_API_BASE_URL` | Journey Log API endpoint | `http://localhost:8002` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | `mock-api-key-dev` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `mock-project-dev.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `mock-project-dev` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `mock-project-dev.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | `000000000000` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:000000000000:web:mockappiddev` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | `G-MOCKIDDEV` |

**Security Note**: Never commit real Firebase credentials or production API keys to version control. Use `.env.local` for local secrets (already in `.gitignore`).

#### Firebase Setup

The application uses Firebase SDK v12+ (modular API) for authentication and other Firebase services. Firebase is initialized via `src/lib/firebase.ts`, which reads configuration from environment variables.

**📖 For detailed setup instructions, see [docs/firebase-setup.md](docs/firebase-setup.md)**

**Quick Setup Summary:**

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication (Email/Password and optionally Google Sign-In)
   - Add authorized domains (localhost for dev, your Cloud Run URL for production)

2. **Get Your Configuration**:
   - In Firebase Console, go to Project Settings > General
   - Under "Your apps", add a Web app or select an existing one
   - Copy the Firebase configuration values (apiKey, authDomain, etc.)

3. **Configure Environment Variables**:
   - For development: Copy `.env.development` to `.env.local` and update with your Firebase config
   - For production: Pass as Docker build arguments via CI/CD
   - See `.env.example` for all required variables with detailed comments

4. **Initialization Details**:
   - Firebase is initialized automatically when the app loads via `src/lib/firebase.ts`
   - The initialization is singleton-safe (handles hot reloads gracefully)
   - Both `firebaseApp` and `auth` instances are exported for use throughout the app
   - Missing or invalid configuration will fail fast at startup with descriptive errors

**Example usage in your components:**
```typescript
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Use the auth instance for Firebase operations
await signInWithEmailAndPassword(auth, email, password);
```

**Important**: All Firebase environment variables must be set at build time (not runtime) because Vite bundles them into the static assets. This means:
- Production builds require Firebase config during the Docker build step
- Environment variables are visible in the client-side bundle (don't store sensitive backend secrets here)
- Use separate Firebase projects for development, staging, and production

**Authentication Components**: The app includes `AuthProvider`, `ProtectedRoute`, `LoginPage`, and `AccountMenu` components. See [docs/firebase-setup.md#authentication-flow-components](docs/firebase-setup.md#authentication-flow-components) for detailed documentation on how these components interact.


## Development

### Starting the Development Server

Run the Vite development server with hot module replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on all source files |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests with Vitest (single run, CI mode) |
| `npm run test:watch` | Run tests in watch mode for development |

### Code Quality

#### Linting

ESLint is configured with React, TypeScript, and Prettier integration. Run the linter to check for code issues:

```bash
npm run lint
```

ESLint will check for:
- TypeScript type errors
- React best practices
- Code style consistency

#### Formatting

Prettier is configured for consistent code formatting across the project:

```bash
npm run format
```

This will automatically format all TypeScript/TSX files in the `src/` directory and configuration files in the root.

#### Testing

Vitest is configured with jsdom and React Testing Library for component testing:

```bash
# Run all tests once (CI mode)
npm run test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

Tests are located in `src/components/__tests__/` and follow the pattern `*.test.tsx`.

## Building for Production

### Local Production Build

Create an optimized production bundle:

```bash
npm run build
```

This command:
1. Runs TypeScript compilation (`tsc -b`) to check types
2. Builds optimized assets with Vite
3. Outputs to the `dist/` directory

The build includes:
- Minified JavaScript bundles
- Optimized CSS with vendor prefixes
- Hashed filenames for cache busting (e.g., `index-DjVD9LGM.css`)
- Tree-shaken dependencies

### Preview Production Build

Test the production build locally before deployment:

```bash
npm run preview
```

This starts a local static file server serving the `dist/` directory, allowing you to verify the production build works correctly.

## Docker Deployment

The application includes a multi-stage Dockerfile optimized for production deployment.

### Building the Docker Image

Build the Docker image locally:

```bash
docker build -t adventure-client:latest .
```

**With production environment variables:**

```bash
docker build \
  --build-arg VITE_DUNGEON_MASTER_API_BASE_URL=https://your-api.run.app \
  --build-arg VITE_JOURNEY_LOG_API_BASE_URL=https://your-log-api.run.app \
  --build-arg VITE_FIREBASE_API_KEY=your-key \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=your-domain \
  --build-arg VITE_FIREBASE_PROJECT_ID=your-project \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=your-bucket \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id \
  --build-arg VITE_FIREBASE_APP_ID=your-app-id \
  --build-arg VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id \
  -t adventure-client:prod .
```

**Important Notes**:
- Environment variables must be provided at build time since Vite bundles them into the static assets
- The Dockerfile declares these as `ARG` directives, making them available during the build process
- ⚠️ **Security Warning**: Build arguments and bundled environment variables are visible in:
  - Docker image layers (via `docker history`)
  - Client-side JavaScript bundle (anyone can inspect the frontend code)
  - Never pass sensitive secrets (API keys, tokens) via build args for frontend applications
  - Use backend services or secure runtime configuration for sensitive data

### Running the Docker Container Locally

Run the container on port 8080:

```bash
docker run -p 8080:8080 adventure-client:latest
```

Access the application at `http://localhost:8080`.

### Docker Image Details

The Dockerfile uses a two-stage build process:

1. **Build Stage** (`node:24-alpine`):
   - Installs dependencies
   - Builds the production bundle
   - Result: `dist/` directory with optimized assets

2. **Serve Stage** (`nginx:alpine`):
   - Copies only the `dist/` files (excludes `node_modules`)
   - Configures nginx with `nginx.conf` for SPA routing
   - Final image size: ~30MB (lightweight and secure)

**Key Features**:
- **SPA Routing**: nginx rewrites all non-file requests to `/index.html` (enables client-side routing)
- **Cache Optimization**: Static assets cached for 1 year, index.html never cached
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Gzip Compression**: Enabled for text-based assets
- **Port 8080**: Required by Cloud Run (configurable via `$PORT` environment variable)

## Cloud Run Deployment

Google Cloud Run provides serverless container hosting with automatic scaling.

### Prerequisites

1. **Google Cloud Project** with billing enabled
2. **Artifact Registry** repository created:
   ```bash
   gcloud artifacts repositories create frontend-repo \
     --repository-format=docker \
     --location=us-central1 \
     --description="Adventure client frontend"
   ```
3. **Docker** and **gcloud CLI** installed locally

### Deployment Steps

#### 1. Build and Tag Image

Build the Docker image with production environment variables:

```bash
# Set your project ID
export PROJECT_ID=your-gcp-project-id
export GITHUB_SHA=$(git rev-parse HEAD)

# Build with production config
docker build \
  --build-arg VITE_DUNGEON_MASTER_API_BASE_URL=https://dungeon-master-api.run.app \
  --build-arg VITE_JOURNEY_LOG_API_BASE_URL=https://journey-log-api.run.app \
  --build-arg VITE_FIREBASE_API_KEY=$FIREBASE_API_KEY \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN \
  --build-arg VITE_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_SENDER_ID \
  --build-arg VITE_FIREBASE_APP_ID=$FIREBASE_APP_ID \
  --build-arg VITE_FIREBASE_MEASUREMENT_ID=$FIREBASE_MEASUREMENT_ID \
  -t us-central1-docker.pkg.dev/$PROJECT_ID/frontend-repo/adventure-client:$GITHUB_SHA .
```

**Important**: Use commit SHA for immutable tags. Avoid using `:latest` in production.

#### 2. Push to Artifact Registry

Authenticate and push the image:

```bash
# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker us-central1-docker.pkg.dev

# Push image
docker push us-central1-docker.pkg.dev/$PROJECT_ID/frontend-repo/adventure-client:$GITHUB_SHA
```

#### 3. Deploy to Cloud Run

Deploy the container:

```bash
gcloud run deploy adventure-client \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/frontend-repo/adventure-client:$GITHUB_SHA \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  --platform managed
```

**Deployment Options Explained**:
- `--allow-unauthenticated`: Makes the frontend publicly accessible
- `--memory 256Mi`: Sufficient for nginx serving static files
- `--cpu 1`: One vCPU is adequate for a frontend service
- `--min-instances 0`: Scales to zero when idle (cost optimization)
- `--max-instances 10`: Limits concurrent instances
- `--port 8080`: Must match the EXPOSE directive in Dockerfile

#### 4. Verify Deployment

After deployment, Cloud Run will output a service URL like:
```
https://adventure-client-abc123-uc.a.run.app
```

Test the deployment:
```bash
curl -I https://adventure-client-abc123-uc.a.run.app
```

### CI/CD Integration

For production deployments, integrate with GitHub Actions or Cloud Build:

1. **Use Workload Identity Federation** (recommended) instead of service account keys
2. **Automate on Git tags or main branch pushes**
3. **Use `$GITHUB_SHA` for image tags** to enable atomic rollbacks
4. **Store secrets in GitHub Secrets** or Google Secret Manager

Example GitHub Actions workflow structure:
```yaml
- Checkout code
- Authenticate to Google Cloud (Workload Identity)
- Build Docker image with build args from secrets
- Push to Artifact Registry
- Deploy to Cloud Run
```

**Security Best Practices**:
- Never commit Firebase credentials or API keys to the repository
- Use environment-specific configurations (staging vs production)
- Rotate credentials regularly
- Monitor Cloud Run logs for unauthorized access attempts


### Environment Differences

| Aspect | Development | Production (Cloud Run) |
|--------|-------------|------------------------|
| **API URLs** | `localhost:8001`, `localhost:8002` | `https://your-api.run.app` |
| **Firebase Config** | Mock/test project | Production Firebase project |
| **Port** | 5173 (Vite dev server) | 8080 (nginx in container) |
| **Build** | Development mode (HMR) | Production bundle (minified) |
| **Environment File** | `.env.local` (not committed) | Build-time `--build-arg` flags |
| **SSL** | Not required | Automatic HTTPS via Cloud Run |

## Project Structure

```
src/
├── config/           # Configuration and environment management
│   └── env.ts       # Typed environment variable access
├── context/         # React Context providers
│   └── AuthContext.tsx  # Authentication state management
├── hooks/           # Custom React hooks
│   └── useAuth.ts   # Auth context consumer hook
├── lib/             # Utility libraries
│   ├── firebase.ts  # Firebase initialization (app & auth)
│   └── http/        # HTTP client utilities
│       └── client.ts # Centralized fetch wrapper
├── types/           # TypeScript type definitions
│   └── auth.ts      # Authentication types
├── pages/           # Page components
├── layouts/         # Layout components
├── router/          # Routing configuration
└── styles/          # Global styles
```

## Architecture

### Environment Configuration

The application uses a type-safe environment configuration system (`src/config/env.ts`) that:

- Validates all required environment variables at startup
- Provides typed access to configuration throughout the app
- Fails fast with descriptive errors if configuration is missing
- Centralizes all env variable access

**Usage:**
```typescript
import { config } from '@/config/env';

// Access typed configuration
const apiUrl = config.dungeonMasterApiUrl;
const isDevMode = config.isDevelopment;
```

### Firebase Integration

The application uses Firebase SDK v12+ (modular API) for authentication and other Firebase services. Firebase is initialized via `src/lib/firebase.ts`.

**Key Features:**
- **Singleton Pattern**: Firebase app is initialized once and reused throughout the application
- **Hot Reload Safe**: Handles Vite's HMR without creating duplicate Firebase instances
- **Environment-Driven**: All configuration comes from environment variables (no hardcoded secrets)
- **Fail-Fast**: Missing or invalid configuration throws descriptive errors at startup
- **Type-Safe**: Exports fully-typed `firebaseApp` and `auth` instances

**Usage:**
```typescript
import { auth, firebaseApp } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Use the pre-initialized auth instance
async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}
```

**Implementation Details:**
- Initialized at module load time (top-level)
- Uses `getApps()` to check if Firebase is already initialized
- Logs successful initialization in development mode
- All configuration sourced from `config.firebase` (from env.ts)

### Authentication Context

Authentication state is managed via React Context (`src/context/AuthContext.tsx`):

- **Current Implementation:** Mock authentication for development
- **Firebase Ready:** Firebase Authentication is now available via `src/lib/firebase.ts`
- Provides global auth state accessible from any component
- Exposes `login`, `logout`, and `register` methods

**Usage:**
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <button onClick={() => login('email', 'password')}>Login</button>;
  }
  
  return (
    <div>
      <p>Welcome, {user.displayName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Important:** Components using `useAuth` must be wrapped in `<AuthProvider>`:
```typescript
import { AuthProvider } from '@/context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

### HTTP Client

A centralized HTTP client (`src/lib/http/client.ts`) provides:

- Automatic JSON parsing and serialization
- Env-based base URL configuration
- Structured error handling (no unhandled promise rejections)
- Request timeout support (default 30s)
- Development logging
- Service-specific client instances

**Basic Usage:**
```typescript
import { httpClient, dungeonMasterClient, journeyLogClient } from '@/lib/http/client';

// Generic client (uses Dungeon Master URL by default)
const data = await httpClient.get('/api/endpoint');

// Service-specific clients
const gameData = await dungeonMasterClient.get('/games');
const logData = await journeyLogClient.post('/logs', { message: 'Started game' });
```

**Error Handling:**
```typescript
import { ApiError } from '@/lib/http/client';

try {
  const data = await httpClient.get('/api/endpoint');
} catch (error) {
  const apiError = error as ApiError;
  console.error(`HTTP ${apiError.status}: ${apiError.message}`);
  // apiError.data contains the error response body
}
```

**Future Enhancements:**
- Auth token injection (TODO in `client.ts`)
- Centralized error logging/tracking
- Request/response interceptors

## Technology Stack

- **React 19** - Latest stable version with modern features
- **TypeScript 5.9** - Type-safe development
- **Vite 7** - Fast build tool and dev server
- **React Router 7** - Client-side routing
- **Vitest** - Fast unit testing with jsdom
- **ESLint + Prettier** - Code quality and formatting
- **nginx (alpine)** - Production web server (in Docker)

### Build Plugins

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) - Fast Refresh with Babel

## Additional Resources

- [Vite Documentation](https://vite.dev/)
- [React 19 Documentation](https://react.dev/)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GCP Deployment Reference](./gcp_deployment_reference.md) - Project deployment guidelines

## License

Licensed under the Apache License, Version 2.0. See LICENSE file for details.
