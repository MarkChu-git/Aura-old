#!/bin/bash
set -e

# ==============================================================================
# Aura Deployment Script
# ==============================================================================
# safely updates the running application.
# Usage: ./scripts/deploy.sh [--build]

BUILD_MODE=false
if [ "$1" == "--build" ]; then
    BUILD_MODE=true
fi

echo ">>> Starting Deployment..."

# 1. Set Secrets Path
export SECRETS_FILE="${SECRETS_FILE:-.env}"
if [ -f "/home/deploy/aura-secrets.env" ]; then
    export SECRETS_FILE="/home/deploy/aura-secrets.env"
fi

# 2. Update Code (if running from git)
echo ">>> Pulling latest code..."
git pull origin main || echo "Git pull warning (ignored)"

# 3. Prepare Images
if [ "$BUILD_MODE" = true ]; then
    echo ">>> Rebuilding images..."
    docker compose -f docker-compose.prod.yml build
else
    echo ">>> Pulling latest images..."
    docker compose -f docker-compose.prod.yml pull
fi

# 4. Deploy (Zero-downtime-ish)
echo ">>> Updating containers..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 5. Clean up
echo ">>> Pruning unused images..."
docker image prune -f

echo ">>> Deployment Successful!"
docker compose -f docker-compose.prod.yml ps
