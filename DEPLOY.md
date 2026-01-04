# 🚀 Secure Production Deployment

This guide explains how to deploy **Aura** securely on a Linux server using Docker Compose.

**📚 Documentation:**
- [Secrets Management](docs/deployment/SECRETS.md) (Required)
- [Nginx & HTTPS](docs/deployment/NGINX.md) (Recommended)
- [Security Baseline](docs/deployment/SECURITY_BASELINE.md) (Recommended)

## Quick Start

### 1. Prepare Server
Ensure Docker and Docker Compose are installed.
Set up your secrets file at `/home/deploy/aura-secrets.env` (See [SECRETS.md](docs/deployment/SECRETS.md)).

### 2. Deploy
Run the production compose file, injecting the secrets path:

```bash
# Export the path to your secure secrets file
export SECRETS_FILE=/home/deploy/aura-secrets.env

# Launch services
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Verify
- **Frontend**: `http://your-server-ip/`
- **Backend API**: `http://your-server-ip/v1/health` (Proxied internally, port 8000 is closed externally)
- **Database**: Port 5432 is closed externally (Secure).

## Troubleshooting
```bash
docker compose -f docker-compose.prod.yml logs -f
```
