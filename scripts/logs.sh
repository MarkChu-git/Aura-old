#!/bin/bash
# Usage: ./scripts/logs.sh [service]

SERVICE=$1
export SECRETS_FILE="${SECRETS_FILE:-.env}"
if [ -f "/home/deploy/aura-secrets.env" ]; then
    export SECRETS_FILE="/home/deploy/aura-secrets.env"
fi

if [ -z "$SERVICE" ]; then
    docker compose -f docker-compose.prod.yml logs -f --tail=100
else
    docker compose -f docker-compose.prod.yml logs -f --tail=100 $SERVICE
fi
