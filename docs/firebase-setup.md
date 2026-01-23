# Firebase Setup Guide

This guide walks you through setting up Firebase Authentication for the Adventure Client application, including project creation, provider configuration, and environment setup for both development and production environments.

## Table of Contents

- [Overview](#overview)
- [Creating a Firebase Project](#creating-a-firebase-project)
- [Registering Your Web App](#registering-your-web-app)
- [Enabling Authentication Providers](#enabling-authentication-providers)
- [Configuring Authorized Domains](#configuring-authorized-domains)
- [Environment Configuration](#environment-configuration)
- [Authentication Flow Components](#authentication-flow-components)
- [Testing Authentication](#testing-authentication)
- [Troubleshooting](#troubleshooting)

## Overview

The Adventure Client uses Firebase Authentication to provide secure user authentication with support for:
- **Email/Password authentication** (required)
- **Google Sign-In** (optional)
- Secure token management and session handling
- Protected routes and user state management

Firebase configuration is provided via environment variables and bundled at build time by Vite.

## Creating a Firebase Project

### Step 1: Access Firebase Console

1. Navigate to the [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Click **Add project** (or **Create a project** if this is your first project)

### Step 2: Project Setup

1. **Project Name**: Enter a descriptive name (e.g., `adventure-game-dev`, `adventure-game-prod`)
   - **Best Practice**: Create separate projects for development, staging, and production
   
2. **Google Analytics**: Choose whether to enable Google Analytics
   - For development projects: Optional (can disable)
   - For production projects: Recommended for monitoring

3. Click **Create project** and wait for provisioning (usually 30-60 seconds)

### Step 3: Project Settings

1. Once created, you'll be redirected to the project dashboard
2. Note your **Project ID** (visible in the project settings) - you'll need this later

## Registering Your Web App

### Step 1: Add a Web App

1. From the Firebase Console project dashboard, click the **Web** icon (`</>`)
2. **App nickname**: Enter a descriptive name (e.g., `Adventure Client Web`)
3. **Firebase Hosting**: Leave unchecked (we use Cloud Run for hosting)
4. Click **Register app**

### Step 2: Gather Configuration Values

After registration, Firebase will display your app configuration. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

**Important**: Copy these values - you'll need them for environment configuration.

### Step 3: Locate Configuration Later

If you need to find these values again:
1. Go to **Project Settings** (gear icon near "Project Overview")
2. Scroll down to **Your apps** section
3. Select your web app
4. Click **Config** to view the configuration object

## Enabling Authentication Providers

### Email/Password Provider (Required)

1. In Firebase Console, navigate to **Build > Authentication**
2. Click **Get started** (if this is your first time)
3. Click the **Sign-in method** tab
4. Click **Email/Password** from the provider list
5. Toggle **Enable** to ON
6. **Email link (passwordless sign-in)**: Leave OFF (not currently used)
7. Click **Save**

#### Password Reset Configuration

Email/Password authentication includes built-in password reset functionality:
- Firebase sends password reset emails automatically
- Email templates can be customized in **Authentication > Templates**
- No additional code changes required in the application

**To customize reset emails**:
1. Go to **Authentication > Templates** tab
2. Click on **Password reset**
3. Customize the email subject and body
4. Update the sender name if desired
5. Click **Save**

### Google Sign-In Provider (Optional)

Google Sign-In provides a convenient OAuth authentication flow for users with Google accounts.

1. In **Authentication > Sign-in method**, click **Google**
2. Toggle **Enable** to ON
3. **Project public-facing name**: Enter your app name (e.g., "Adventure Game")
4. **Project support email**: Select your email from the dropdown
5. Click **Save**

**Prerequisites for Google Sign-In**:
- A Google Cloud Project (automatically created with Firebase)
- Valid authorized domains configured (see next section)
- OAuth consent screen configured (Firebase handles basic setup)

**Note**: The `signInWithGoogle()` method in `AuthContext.tsx` uses popup-based authentication. Ensure popup blockers are disabled during testing.

## Configuring Authorized Domains

Firebase requires you to whitelist all domains that can use authentication. By default, only `localhost` is authorized.

### Step 1: Add Authorized Domains

1. Go to **Authentication > Settings** tab
2. Scroll down to **Authorized domains** section
3. You should see `localhost` already listed

### Step 2: Add Development Domain

For local development, `localhost` is already included. If you use a custom local domain:
1. Click **Add domain**
2. Enter your domain (e.g., `dev.local`, `127.0.0.1`)
3. Click **Add**

### Step 3: Add Production Domain (Cloud Run)

When deploying to Cloud Run, you must authorize your Cloud Run service URL:

1. Deploy your application to Cloud Run (see [README.md](../README.md#cloud-run-deployment))
2. Note the service URL (e.g., `adventure-client-xyz123-uc.a.run.app`)
3. In Firebase Console > **Authentication > Settings > Authorized domains**
4. Click **Add domain**
5. Enter your Cloud Run domain: `adventure-client-xyz123-uc.a.run.app`
6. Click **Add**

**Important**: 
- Cloud Run URLs are auto-generated and may change if you recreate the service
- If you have a custom domain, add that as well
- Both HTTP and HTTPS are supported, but Cloud Run uses HTTPS by default
- Subdomains are not automatically whitelisted - add each one explicitly

### Common Domain Patterns

| Environment | Domain Example | When to Add |
|-------------|----------------|-------------|
| Local Dev | `localhost` | Included by default |
| Local Dev (custom) | `dev.local` | If using custom hosts file |
| Cloud Run (auto) | `adventure-client-xyz123-uc.a.run.app` | After first deployment |
| Custom Domain | `app.yourdomain.com` | If using custom domain mapping |
| Staging | `adventure-client-staging-xyz.run.app` | For staging environment |

## Environment Configuration

Firebase configuration is provided via environment variables that are bundled into the application at **build time** by Vite.

### Understanding Environment Files

The application uses three environment files:

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `.env.example` | Template showing all required variables | ✅ Yes (no secrets) |
| `.env.development` | Development defaults (mock values) | ✅ Yes (no real secrets) |
| `.env.production` | Production template (empty placeholders) | ✅ Yes (no secrets) |
| `.env.local` | Your local overrides (real Firebase config) | ❌ No (in .gitignore) |

**Environment Variables Overview**:

The application requires two types of environment variables:
1. **API Base URLs**: Backend service endpoints (Dungeon Master API, Journey Log API)
2. **Firebase Configuration**: Authentication and Firebase service settings

All variables are prefixed with `VITE_` so they can be bundled by Vite at build time.

### Step 1: Create Your Local Environment File

For local development:

```bash
cd adventure-client
cp .env.development .env.local
```

### Step 2: Update `.env.local` with Your Firebase Config

Open `.env.local` and replace the mock values with your actual Firebase configuration:

```bash
# API Base URLs (keep these for local development)
VITE_DUNGEON_MASTER_API_BASE_URL=http://localhost:8001
VITE_JOURNEY_LOG_API_BASE_URL=http://localhost:8002

# Firebase Configuration (replace with your actual values from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-dev
VITE_FIREBASE_STORAGE_BUCKET=your-project-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 3: Mapping Firebase Console Values to Environment Variables

| Firebase Console Value | Environment Variable | Required? |
|------------------------|----------------------|-----------|
| `apiKey` | `VITE_FIREBASE_API_KEY` | ✅ Yes |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` | ✅ Yes |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` | ✅ Yes |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` | ⚠️ Optional |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` | ⚠️ Optional |
| `appId` | `VITE_FIREBASE_APP_ID` | ✅ Yes |
| `measurementId` | `VITE_FIREBASE_MEASUREMENT_ID` | ⚠️ Optional |

**Note**: The application validates required fields at startup. Missing required values will cause an error with a descriptive message.

### Production Environment Configuration

For production deployments to Cloud Run:

#### Option 1: Docker Build Arguments (Recommended)

Pass environment variables as build arguments during Docker build:

```bash
docker build \
  --build-arg VITE_DUNGEON_MASTER_API_BASE_URL=https://dungeon-master-api.run.app \
  --build-arg VITE_JOURNEY_LOG_API_BASE_URL=https://journey-log-api.run.app \
  --build-arg VITE_FIREBASE_API_KEY=AIzaSy... \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=your-project-prod.firebaseapp.com \
  --build-arg VITE_FIREBASE_PROJECT_ID=your-project-prod \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=your-project-prod.appspot.com \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012 \
  --build-arg VITE_FIREBASE_APP_ID=1:123456789012:web:abc123 \
  --build-arg VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX \
  -t adventure-client:prod .
```

#### Option 2: CI/CD Environment Secrets

In GitHub Actions or Cloud Build, store secrets securely:

**GitHub Actions** (recommended):
1. Go to repository **Settings > Secrets and variables > Actions**
2. Add secrets for each Firebase variable
3. Reference in workflow:
   ```yaml
   - name: Build Docker image
     run: |
       docker build \
         --build-arg VITE_FIREBASE_API_KEY=${{ secrets.FIREBASE_API_KEY }} \
         --build-arg VITE_FIREBASE_AUTH_DOMAIN=${{ secrets.FIREBASE_AUTH_DOMAIN }} \
         ...
   ```

**Google Secret Manager** (advanced):
1. Store secrets in Secret Manager
2. Grant Cloud Build service account access
3. Use `--build-arg` with secret values in build steps

### Security Considerations

⚠️ **Important Security Notes**:

1. **API Keys in Frontend**: Firebase API keys are **not secret** and are meant to be public
   - They identify your Firebase project
   - Access is controlled by Firebase Security Rules, not by hiding the API key
   - See [Firebase documentation](https://firebase.google.com/docs/projects/api-keys)

2. **Never Commit Real Secrets**: Even though Firebase API keys are public, never commit:
   - Service account keys
   - Cloud Run service URLs (if they contain sensitive info)
   - Database credentials
   - Third-party API keys

3. **Environment-Specific Projects**: Use separate Firebase projects for:
   - Development (for testing)
   - Staging (for QA)
   - Production (for live users)

4. **Build-Time vs Runtime**: 
   - Vite bundles env vars at **build time**
   - Variables are visible in the client JavaScript bundle
   - This is expected and safe for Firebase configuration
   - Do not store backend secrets in frontend env vars

## API Authentication Integration

The Adventure Client uses Firebase Authentication to secure API requests to both backend services (Dungeon Master API and Journey Log API). This section explains how authentication tokens flow from Firebase to the backend APIs.

### Authentication Architecture

```
┌──────────────┐      Firebase Auth      ┌──────────────┐
│   Browser    │ ◄──────────────────────► │   Firebase   │
│  (Frontend)  │    Login/Token Refresh   │  Auth Server │
└──────┬───────┘                          └──────────────┘
       │
       │ API Request + Headers
       │ - Authorization: Bearer <token>
       │ - X-User-Id: <uid>
       │
       ├──────────────────────────────────►┌──────────────────┐
       │                                    │ Dungeon Master   │
       │         200 OK / 401 Unauthorized  │      API         │
       │◄───────────────────────────────────┤                  │
       │                                    │ Validates token  │
       │                                    │ with Firebase    │
       │                                    └──────────────────┘
       │
       └──────────────────────────────────►┌──────────────────┐
                                            │  Journey Log     │
                200 OK / 401 Unauthorized   │      API         │
       ◄────────────────────────────────────┤                  │
                                            │ Validates token  │
                                            │ + checks User-Id │
                                            └──────────────────┘
```

### How Authentication Tokens Are Attached

The application automatically attaches authentication headers to all API requests using the OpenAPI generated clients:

**1. Authentication Provider Setup** (`src/context/AuthContext.tsx`):
```typescript
export interface AuthProvider {
  getIdToken(forceRefresh?: boolean): Promise<string | null>;
  uid: string | null;
}
```

The `AuthContext` provides:
- `getIdToken()`: Returns current Firebase ID token (JWT)
- `uid`: Current user's unique Firebase user ID

**2. API Client Configuration** (`src/api/index.ts`):

When the app initializes, it configures both API clients with authentication:

```typescript
// Dungeon Master API: Only needs Authorization header
OpenAPI.TOKEN = async () => {
  const token = await authProvider.getIdToken();
  return token || '';
};

// Journey Log API: Needs both Authorization + X-User-Id headers
JourneyLogAPI.TOKEN = async () => {
  const token = await authProvider.getIdToken();
  return token || '';
};

JourneyLogAPI.HEADERS = async () => ({
  'X-User-Id': authProvider.uid || '',
});
```

**3. Resulting HTTP Headers**:

For **Dungeon Master API** requests:
```http
GET /api/health HTTP/1.1
Host: localhost:8001
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
```

For **Journey Log API** requests:
```http
GET /api/characters HTTP/1.1
Host: localhost:8002
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
X-User-Id: abc123def456xyz789
```

### Token Lifecycle and Refresh

**Token Expiration**: Firebase ID tokens expire after 1 hour.

**Automatic Refresh**: The application implements automatic token refresh using a 401 retry mechanism:

1. **Initial Request**: Client sends API request with current token
2. **401 Response**: Backend returns 401 if token is expired
3. **Token Refresh**: Client calls `getIdToken(forceRefresh: true)` to get fresh token
4. **Retry Request**: Client retries the original request with new token (single attempt)
5. **Final Response**: Returns success or final error to caller

**Implementation** (`src/lib/http/client.ts`):
```typescript
try {
  response = await fetch(url, options);
  
  if (response.status === 401 && authProvider && !isRetry) {
    // Token might be expired, refresh and retry once
    await authProvider.getIdToken(true);
    return request(url, options, true); // Retry with isRetry=true
  }
} catch (error) {
  // Handle network errors
}
```

**Important Notes**:
- Only ONE retry attempt is made to avoid infinite loops
- Token refresh happens in the background (user doesn't see it)
- If retry fails, user sees authentication error
- Users can manually refresh by signing out and back in

### Backend Token Validation

Both backend services validate tokens using the Firebase Admin SDK:

1. **Extract Token**: Backend extracts `Authorization: Bearer <token>` header
2. **Verify with Firebase**: Backend calls Firebase Admin SDK to verify token signature and claims
3. **Check Expiration**: Firebase verifies token hasn't expired
4. **Extract User ID**: Backend extracts `uid` claim from verified token
5. **Authorize Request**: Backend checks if user has permission for the requested resource

**Token Validation Failures**:
- Expired token → 401 Unauthorized (triggers frontend refresh)
- Invalid signature → 401 Unauthorized (user must re-authenticate)
- Missing token → 401 Unauthorized (user must log in)
- Wrong Firebase project → 401 Unauthorized (configuration mismatch)

### Header Requirements by Service

| Service | Authorization Header | X-User-Id Header | Notes |
|---------|---------------------|------------------|-------|
| **Dungeon Master API** | ✅ Required | ❌ Not used | Token contains all user info |
| **Journey Log API** | ✅ Required | ✅ Required | Needs explicit User-Id for queries |

**Why X-User-Id?**

The Journey Log API requires the `X-User-Id` header for:
- Efficiently querying user-specific data without parsing JWT
- Validating that the requesting user matches the resource owner
- Simplifying database queries and access control logic

The backend validates that the `X-User-Id` matches the `uid` claim in the token.

### Authentication Requirements for API Calls

**User Must Be Authenticated**:
All API endpoints (except `/health`) require a valid Firebase authentication token. Users must:

1. Sign up or sign in via the login page (`/login`)
2. Obtain a Firebase ID token (happens automatically after login)
3. Have the token attached to API requests (happens automatically)

**Protected Routes**:
The application uses `ProtectedRoute` to ensure users are authenticated before accessing API-dependent pages:

```typescript
<Route path="/app" element={
  <ProtectedRoute>
    <AppLayout />
  </ProtectedRoute>
} />
```

**Unauthenticated Access**:
If a user tries to access a protected page without authentication:
1. `ProtectedRoute` detects no authenticated user
2. User is redirected to `/login`
3. After successful login, user is redirected back to the original page

### Testing API Authentication

Use the **Debug/Diagnostic Page** (`/debug`) to test API authentication:

1. **Start both backend services**:
   ```bash
   # Dungeon Master API on port 8001
   # Journey Log API on port 8002
   ```

2. **Navigate to debug page**: `http://localhost:5173/debug`

3. **Authenticate**: Click login link and sign in with Firebase

4. **Test endpoints**: Click test buttons for each API

5. **Verify headers**: The debug page shows all headers sent, including:
   - Authorization token (masked as `abcd...wxyz` for security)
   - X-User-Id (for Journey Log API)

### Troubleshooting API Authentication

**Issue: "401 Unauthorized" on all API requests**
- **Cause**: User not logged in or token expired
- **Solution**:
  1. Ensure user is logged in (check auth state on debug page)
  2. Try signing out and signing in again
  3. Check that backend Firebase project matches frontend configuration
  4. Verify backend can reach Firebase Auth servers

**Issue: "Missing or invalid X-User-Id header"**
- **Cause**: X-User-Id header not sent or doesn't match token
- **Cause**: Journey Log API only
- **Solution**:
  1. Ensure `configureApiClients(authProvider)` is called on app init
  2. Verify `authProvider.uid` is not null
  3. Check that backend validates both token and X-User-Id

**Issue: Token refresh fails with 401**
- **Symptom**: First request succeeds, subsequent requests fail
- **Cause**: Token expired and refresh failed
- **Solution**:
  1. Check browser console for Firebase errors
  2. Verify Firebase project configuration is correct
  3. Ensure browser has network connectivity
  4. Try clearing browser cache and signing in again
  5. Check Firebase Console > Authentication > Users for account status

**Issue: "CORS error" when calling authenticated endpoints**
- **Cause**: Backend CORS not configured for credentials
- **Solution**:
  1. Backend must allow credentials: `Access-Control-Allow-Credentials: true`
  2. Backend must allow Authorization header: `Access-Control-Allow-Headers: Authorization, X-User-Id`
  3. Backend cannot use wildcard origin with credentials (must specify exact origin)

**Issue: Different Firebase projects between environments**
- **Symptom**: Token works locally but not in staging/production
- **Cause**: Frontend uses different Firebase project than backend expects
- **Solution**:
  1. Verify all environments use matching Firebase projects:
     - Frontend `.env.local` → `VITE_FIREBASE_PROJECT_ID`
     - Backend configuration → Firebase Admin SDK project
  2. Use separate projects for dev/staging/production consistently
  3. Document Firebase project IDs for each environment

### Security Best Practices

1. **Never Share Tokens**: Tokens are sensitive credentials; don't log them in plain text
2. **Use HTTPS**: Always use HTTPS in production to prevent token interception
3. **Short-Lived Tokens**: Firebase tokens expire after 1 hour (good security practice)
4. **Backend Validation**: Backends must always validate tokens with Firebase (never trust client)
5. **Separate Projects**: Use different Firebase projects for dev/staging/production
6. **Monitor Auth Events**: Check Firebase Console for suspicious login patterns
7. **Revoke Access**: Users can be disabled in Firebase Console if compromised

For more authentication troubleshooting, see the [Troubleshooting](#troubleshooting) section below.

## Authentication Flow Components

The application uses several interconnected components to manage authentication state and user flows.

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        AuthProvider                          │
│  (src/context/AuthContext.tsx)                              │
│                                                              │
│  - Manages global auth state                                │
│  - Subscribes to Firebase auth changes                       │
│  - Provides auth methods to entire app                       │
└──────────────────┬──────────────────────────────────────────┘
                   │ Wraps App
                   │
        ┌──────────┴──────────┬──────────────────────────┐
        │                     │                          │
┌───────▼────────┐   ┌────────▼─────────┐   ┌───────────▼──────────┐
│ ProtectedRoute │   │   LoginPage      │   │    AccountMenu       │
│                │   │                  │   │                      │
│ - Checks auth  │   │ - Email/pass     │   │ - User display       │
│ - Redirects to │   │ - Google sign-in │   │ - Sign out button    │
│   /login       │   │ - Form handling  │   │                      │
└────────────────┘   └──────────────────┘   └──────────────────────┘
```

### AuthProvider

**Location**: `src/context/AuthContext.tsx`

The `AuthProvider` is a React Context provider that wraps the entire application and manages authentication state.

**Key Features**:
- Subscribes to Firebase `onAuthStateChanged` events
- Maintains current user state across the app
- Provides authentication methods (`signInWithEmailPassword`, `signUpWithEmailPassword`, `signOutUser`, `signInWithGoogle`)
- Handles loading states during authentication
- Exposes error state for authentication failures

**Setup** (in `src/main.tsx`):
```typescript
import { AuthProvider } from '@/context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
```

**Usage in Components**:
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, loading, signInWithEmailPassword, signOutUser } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Welcome, {user.email}!</div>;
}
```

**State Properties**:
- `user`: Current Firebase user object or `null`
- `uid`: User ID (shortcut to `user.uid`)
- `loading`: `true` during initial auth state check
- `error`: Last authentication error or `null`

**Methods**:
- `signInWithEmailPassword(email, password)`: Sign in with email/password
- `signUpWithEmailPassword(email, password)`: Create new account
- `signOutUser()`: Sign out current user
- `signInWithGoogle()`: Sign in with Google popup
- `getIdToken(forceRefresh?)`: Get user's ID token for API calls

### ProtectedRoute

**Location**: `src/components/ProtectedRoute.tsx`

A wrapper component that protects routes from unauthenticated access.

**Behavior**:
1. **Loading**: Shows loading spinner while checking auth state
2. **Unauthenticated**: Redirects to `/login` page
3. **Authenticated**: Renders child components

**Usage** (in `src/router/index.tsx`):
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
  },
]);
```

**Flow Diagram**:
```
User navigates to /app
         │
         ▼
    Loading? ──Yes──▶ Show loading spinner
         │
         No
         │
         ▼
  Authenticated? ──No──▶ Redirect to /login
         │
         Yes
         │
         ▼
   Render children (AppLayout)
```

### LoginPage

**Location**: `src/pages/LoginPage.tsx`

The login and registration page with support for email/password and Google authentication.

**Features**:
- **Dual Mode**: Toggle between "Sign In" and "Sign Up" modes
- **Email/Password**: Username and password authentication
- **Google Sign-In**: OAuth popup-based authentication (if enabled in Firebase)
- **Form Validation**: Client-side validation for email and password
- **Error Handling**: User-friendly Firebase error messages
- **Auto-Redirect**: Redirects to `/app` after successful authentication

**Form Fields**:
- **Email**: Must be valid email format
- **Password**: 
  - Sign In: Any length
  - Sign Up: Minimum 6 characters (Firebase requirement)

**Error Messages**:
The component translates Firebase error codes into user-friendly messages:
- `auth/invalid-email` → "Invalid email address format."
- `auth/user-not-found` → "No account found with this email."
- `auth/wrong-password` → "Incorrect password."
- `auth/email-already-in-use` → "An account with this email already exists."
- `auth/weak-password` → "Password should be at least 6 characters."
- And more...

**Google Sign-In Notes**:
- Uses popup-based flow (`signInWithPopup`)
- Requires Google provider enabled in Firebase Console
- Requires authorized domains configured
- Browser popup blockers must be disabled
- Handles popup errors gracefully

### AccountMenu

**Location**: `src/components/AccountMenu.tsx`

A component that displays the current user's information and provides a sign-out button.

**Features**:
- Shows user's display name or email
- Sign out button
- Loading state
- Auto-hides when not authenticated

**Display Logic**:
1. If `loading`: Shows "Loading..." text
2. If no `user`: Renders `null` (hidden)
3. If `user`: Shows display name (or email as fallback) and sign-out button

**Typical Placement**: In the application header/navbar

```typescript
// In your AppLayout or Header component
import AccountMenu from '@/components/AccountMenu';

function Header() {
  return (
    <header>
      <h1>Adventure Game</h1>
      <AccountMenu />
    </header>
  );
}
```

### Authentication Flow Sequence

**New User Registration**:
```
1. User navigates to /login
2. User clicks "Sign Up" tab
3. User enters email and password
4. User clicks "Sign Up" button
5. LoginPage calls signUpWithEmailPassword()
6. AuthContext creates Firebase user account
7. Firebase triggers onAuthStateChanged event
8. AuthContext updates user state
9. LoginPage useEffect detects user state change
10. User redirected to /app
```

**Existing User Login**:
```
1. User navigates to /login (or redirected by ProtectedRoute)
2. User enters email and password
3. User clicks "Sign In" button
4. LoginPage calls signInWithEmailPassword()
5. AuthContext authenticates with Firebase
6. Firebase triggers onAuthStateChanged event
7. AuthContext updates user state
8. User redirected to /app
```

**Google Sign-In**:
```
1. User navigates to /login
2. User clicks "Continue with Google" button
3. LoginPage calls signInWithGoogle()
4. AuthContext opens Google OAuth popup
5. User selects Google account in popup
6. Google returns user info to Firebase
7. Firebase triggers onAuthStateChanged event
8. AuthContext updates user state
9. User redirected to /app
```

**Sign Out**:
```
1. User clicks "Sign Out" in AccountMenu
2. AccountMenu calls signOutUser()
3. AuthContext signs out from Firebase
4. Firebase triggers onAuthStateChanged event (user = null)
5. AuthContext clears user state
6. ProtectedRoute detects no user
7. User redirected to /login
```

## Testing Authentication

### Local Development Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the login page**:
   - Open `http://localhost:5173/login` in your browser

3. **Test Email/Password Registration**:
   - Click "Sign Up" tab
   - Enter an email (e.g., `test@example.com`)
   - Enter a password (minimum 6 characters)
   - Click "Sign Up"
   - You should be redirected to `/app`
   - Check Firebase Console > Authentication > Users to verify the account was created

4. **Test Sign Out**:
   - Click the "Sign Out" button in the AccountMenu
   - You should be redirected to `/login`

5. **Test Email/Password Sign In**:
   - Enter the same email and password
   - Click "Sign In"
   - You should be redirected to `/app`

6. **Test Google Sign-In** (if enabled):
   - Click "Continue with Google"
   - Select a Google account in the popup
   - You should be redirected to `/app`

7. **Test Protected Routes**:
   - While signed in, navigate to `/app` - should render the protected page
   - Sign out
   - Try to navigate to `/app` - should redirect to `/login`

### Production Testing

After deploying to Cloud Run:

1. Ensure your Cloud Run URL is added to Firebase Authorized Domains
2. Visit your Cloud Run URL (e.g., `https://adventure-client-xyz.run.app`)
3. Repeat the authentication tests above
4. Verify that:
   - All authentication flows work over HTTPS
   - Redirects work correctly
   - No CORS errors in browser console
   - Firebase Console shows new users

### Troubleshooting Tests

If authentication fails during testing:

1. **Check Browser Console**: Look for Firebase errors
2. **Verify Environment Variables**: Ensure `.env.local` has correct values
3. **Check Firebase Console**: 
   - Authentication enabled?
   - Providers enabled?
   - Domains authorized?
4. **Clear Browser Cache**: Sometimes helps with auth state issues
5. **Check Network Tab**: Look for failed API requests to Firebase

## Troubleshooting

### Common Issues and Solutions

#### 1. "Firebase configuration is incomplete" Error

**Symptom**: Error on app startup saying Firebase config is missing.

**Cause**: Missing or incomplete environment variables.

**Solution**:
1. Verify `.env.local` exists and contains all required variables
2. Check that variable names start with `VITE_` (required by Vite)
3. Restart the dev server after changing env files
4. Verify values are copied correctly from Firebase Console

Required variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

#### 2. "auth/unauthorized-domain" Error

**Symptom**: Error during login: "This domain is not authorized..."

**Cause**: Current domain not in Firebase Authorized Domains list.

**Solution**:
1. Go to Firebase Console > Authentication > Settings > Authorized Domains
2. Add your domain:
   - For local dev: `localhost` (should already be there)
   - For Cloud Run: Your full Cloud Run domain (e.g., `adventure-client-xyz.run.app`)
   - Include the protocol in testing but not in Firebase config (add `example.com`, not `https://example.com`)
3. Wait 1-2 minutes for changes to propagate
4. Clear browser cache and try again

#### 3. "auth/popup-blocked" Error

**Symptom**: Google Sign-In fails with popup blocked error.

**Cause**: Browser is blocking the authentication popup.

**Solution**:
1. Allow popups for your domain in browser settings
2. Try clicking the Google Sign-In button again
3. Ensure popup is triggered by user action (not automatically)

#### 4. "auth/api-key-not-valid" Error

**Symptom**: Firebase API key validation error.

**Cause**: Incorrect API key or API key restrictions in Google Cloud Console.

**Solution**:
1. Verify API key copied correctly from Firebase Console
2. In Google Cloud Console > APIs & Services > Credentials:
   - Find your Browser API key
   - Check "Application restrictions" - should be "None" or include your domains
   - Check "API restrictions" - ensure Firebase services are enabled
3. Generate a new API key if necessary:
   - Firebase Console > Project Settings > General > Web apps > Add app
   - Copy new configuration

#### 5. Environment Variables Not Updating

**Symptom**: Changes to `.env.local` don't take effect.

**Cause**: Vite doesn't hot-reload environment variable changes.

**Solution**:
1. Stop the dev server (`Ctrl+C`)
2. Restart the dev server (`npm run dev`)
3. Hard refresh browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)

#### 6. "Email already in use" During Testing

**Symptom**: Cannot create test accounts because email is already registered.

**Cause**: Email address already used in Firebase Auth.

**Solution**:
1. Use a different email for testing
2. Or delete the user from Firebase Console:
   - Go to Authentication > Users
   - Find the user
   - Click the three-dot menu > Delete account
3. Or use sign-in instead of sign-up if account exists

#### 7. Firebase Project Not Found

**Symptom**: Error saying Firebase project doesn't exist.

**Cause**: Wrong `projectId` in environment variables.

**Solution**:
1. Go to Firebase Console > Project Settings
2. Verify your Project ID (not the project name)
3. Update `VITE_FIREBASE_PROJECT_ID` in `.env.local`
4. Restart dev server

#### 8. CORS Errors in Production

**Symptom**: CORS errors when deployed to Cloud Run.

**Cause**: Authorized domains not configured for Cloud Run URL.

**Solution**:
1. Note your full Cloud Run domain
2. Add it to Firebase Authorized Domains (see issue #2)
3. Verify no typos in domain
4. Wait a few minutes for DNS propagation

#### 9. "auth/internal-error" After Deployment

**Symptom**: Generic internal error in production but works locally.

**Cause**: Missing or incorrect environment variables in Docker build.

**Solution**:
1. Verify all `--build-arg` flags passed to `docker build` match the ARG declarations in the [Dockerfile](../Dockerfile)
2. Check if the variables were bundled into the built assets:
   ```bash
   # Extract and inspect the built JavaScript bundle
   docker create --name temp adventure-client:prod
   docker cp temp:/usr/share/nginx/html/assets ./inspect-assets
   docker rm temp
   grep -r "FIREBASE_API_KEY\|FIREBASE_PROJECT_ID" ./inspect-assets
   rm -rf ./inspect-assets
   ```
   If Firebase config values don't appear in the bundle, they weren't provided at build time.
3. Rebuild Docker image with correct build arguments
4. Redeploy to Cloud Run

#### 10. Google Sign-In Not Showing

**Symptom**: Google sign-in button doesn't appear on login page.

**Cause**: Google provider not enabled in Firebase Console.

**Solution**:
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Google provider
3. Set project name and support email
4. Click Save
5. Refresh the login page

#### 11. Backend API Returns 403 Forbidden

**Symptom**: API calls fail with 403 error after successful authentication.

**Cause**: Backend authorization rules reject the request even with valid token.

**Solution**:
1. Verify user has permission to access the resource
2. Check backend authorization logic (separate from authentication)
3. Ensure backend correctly extracts user ID from token
4. Review backend logs for authorization failures

#### 12. Token Validation Fails on Backend

**Symptom**: Backend logs show "invalid token" or "signature verification failed".

**Cause**: Backend Firebase configuration doesn't match frontend Firebase project.

**Solution**:
1. Verify backend uses same Firebase project as frontend:
   - Frontend: `VITE_FIREBASE_PROJECT_ID` in env files
   - Backend: Firebase Admin SDK initialization
2. Ensure backend has correct service account credentials
3. Check backend can reach Firebase Auth servers (network/firewall)
4. Verify token format: should start with `eyJhbGci...`

#### 13. API Calls Work in Browser but Fail in Tests

**Symptom**: API integration works in development but fails in automated tests.

**Cause**: Tests not properly mocking authentication or API clients.

**Solution**:
1. Mock `AuthProvider` in test setup:
   ```typescript
   const mockAuthProvider = {
     getIdToken: jest.fn().mockResolvedValue('mock-token'),
     uid: 'mock-user-id',
   };
   ```
2. Mock API responses for deterministic tests
3. Use test Firebase project with test users
4. Don't call real APIs in unit tests (use mocks/stubs)

### Getting Help

If you encounter issues not covered here:

1. **Check Firebase Status**: [https://status.firebase.google.com/](https://status.firebase.google.com/)
2. **Firebase Documentation**: [https://firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)
3. **Browser Console**: Check for detailed error messages
4. **Firebase Console Logs**: Authentication > Users tab shows recent sign-in attempts
5. **GitHub Issues**: Open an issue in the repository with:
   - Error message (sanitized of secrets)
   - Steps to reproduce
   - Environment (local dev or Cloud Run)
   - Browser and OS

### Debugging Tips

Enable verbose Firebase logging in development:

```typescript
// In src/lib/firebase.ts (for debugging only)
import { getAuth } from 'firebase/auth';

const auth = getAuth(firebaseApp);
auth.useDeviceLanguage(); // Use device language for error messages
```

Check auth state using React DevTools:

1. Install React DevTools browser extension
2. Open DevTools and go to the "Components" tab
3. Find the `AuthProvider` component in the tree
4. Inspect the `value` prop to see current auth state (user, loading, error)

Alternatively, add temporary debug logging in your component:

```typescript
// In any component using useAuth
const { user, loading } = useAuth();
console.log('Auth state:', { user, loading });
```

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Auth Web Quickstart](https://firebase.google.com/docs/auth/web/start)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Main README](../README.md)

## Security Best Practices

1. **Use Separate Projects**: Maintain separate Firebase projects for dev, staging, and production
2. **Rotate Credentials**: Periodically rotate API keys and review authorized domains
3. **Monitor Usage**: Check Firebase Console > Usage for unexpected activity
4. **Enable MFA**: Consider enabling multi-factor authentication for production users
5. **Security Rules**: Configure Firestore/Storage security rules (if using these services)
6. **Review IAM**: Regularly audit Firebase project IAM permissions
7. **HTTPS Only**: Always use HTTPS in production (Cloud Run provides this automatically)
8. **Token Refresh**: The app automatically refreshes ID tokens as needed
9. **Sign-Out on Device Loss**: Advise users to sign out on shared devices
10. **Password Policies**: Firebase enforces minimum 6-character passwords by default

## Summary

You should now have:
- ✅ A Firebase project with Authentication enabled
- ✅ Email/Password provider configured
- ✅ (Optional) Google Sign-In provider configured
- ✅ Authorized domains set up for local and production environments
- ✅ Environment variables configured locally
- ✅ Understanding of authentication flow components
- ✅ Tested authentication working in your application

If you encounter any issues, refer to the [Troubleshooting](#troubleshooting) section or open a GitHub issue.
