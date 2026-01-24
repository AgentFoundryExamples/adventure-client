# STAGE 1: BUILD
FROM node:24-alpine AS builder

# Declare build arguments for production environment variables
# These are passed via --build-arg during docker build and made available to Vite
ARG VITE_DUNGEON_MASTER_API_BASE_URL
ARG VITE_JOURNEY_LOG_API_BASE_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID

WORKDIR /app

# Copy package files first (for reference in layer metadata)
COPY package.json package-lock.json ./

# Copy all source files
# Note: Must copy source before npm ci due to Alpine Linux timing requirements
# See: .dockerignore for details on why node_modules is not excluded
COPY . .

# Install dependencies and build
# Combined into single RUN to reduce layer count and leverage npm ci's speed
RUN npm ci && npm run build

# STAGE 2: SERVE
FROM nginx:alpine

# Copy build artifacts from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run requires listening on PORT (defaults to 8080)
EXPOSE 8080

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
