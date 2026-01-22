# STAGE 1: BUILD
# Using Node 22 LTS instead of 24 for better Docker compatibility
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files and source
COPY package.json package-lock.json ./
COPY . .

# Install dependencies and build
# Note: Running install after COPY . to workaround npm timing issues in Docker
RUN npm install --loglevel=verbose && npm run build

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
