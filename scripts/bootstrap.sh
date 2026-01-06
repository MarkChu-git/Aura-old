#!/bin/bash
set -e

# ==============================================================================
# Aura Server Bootstrap Script
# ==============================================================================
# Sets up a fresh server from zero to running.
# Usage: ./scripts/bootstrap.sh

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}>>> Starting Aura Bootstrap...${NC}"

# 1. Check Prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: docker is not installed.${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: docker compose is not installed.${NC}"
    exit 1
fi

# 2. Check Environment
if [ -f "/home/deploy/aura-secrets.env" ]; then
    echo -e "${GREEN}Found secure secrets file at /home/deploy/aura-secrets.env${NC}"
    export SECRETS_FILE="/home/deploy/aura-secrets.env"
elif [ -f ".env" ]; then
    echo -e "${GREEN}Found local .env file.${NC}"
    export SECRETS_FILE=".env"
else
    echo -e "${RED}Error: No secrets file found.${NC}"
    echo "Please copy .env.example to .env or /home/deploy/aura-secrets.env and populate variables."
    exit 1
fi

# 3. Launch Stack
echo -e "${BLUE}>>> Pulling and building images...${NC}"
docker compose -f docker-compose.prod.yml build

echo -e "${BLUE}>>> Starting services...${NC}"
docker compose -f docker-compose.prod.yml up -d

# 4. Wait for Health
echo -e "${BLUE}>>> Waiting for services to be healthy...${NC}"
# Simple wait loop
TIMEOUT=60
while [ $TIMEOUT -gt 0 ]; do
    if docker compose -f docker-compose.prod.yml ps | grep -q "(healthy)"; then
        break
    fi
    echo -n "."
    sleep 2
    TIMEOUT=$((TIMEOUT-2))
done
echo ""

# 5. Verify
echo -e "${BLUE}>>> Verifying deployment...${NC}"
if curl -s -f http://localhost/v1/health > /dev/null; then
    echo -e "${GREEN}SUCCESS: API is reachable at http://localhost/v1/health${NC}"
else
    echo -e "${RED}WARNING: API health check failed.${NC}"
fi

echo -e "${GREEN}>>> Bootstrap Complete! Access via http://<YOUR_IP>/${NC}"
