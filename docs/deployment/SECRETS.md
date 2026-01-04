# Secrets Management Guide

For production deployment, **Aura** enforces strict secrets isolation. Secrets are **never** stored in the code repository or Docker images.

## 1. Secrets Location
On your production server, create a dedicated secrets file in a secure location, such as the deployment user's home directory.

**Recommended Path:**
`/home/deploy/aura-secrets.env`

## 2. File Permissions
Restrict access so only the owner (deployment user) can read this file.

```bash
touch /home/deploy/aura-secrets.env
chmod 600 /home/deploy/aura-secrets.env
```

## 3. Required Variables
Populate the file with the following variables (see `.env.example` for reference):

```ini
# Database
POSTGRES_USER=aura_prod_user
POSTGRES_PASSWORD=generate_secure_random_password_here
POSTGRES_DB=aura_db

# Security
SECRET_KEY=generate_very_long_random_string_here
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI Services
OPENAI_API_KEY=sk-your-openai-key
# OR
DEEPSEEK_API_KEY=your-deepseek-key

# External Integations
S3_ACCESS_KEY=your-s3-key
S3_SECRET_KEY=your-s3-secret
```

## 4. Usage with Docker Compose
When deploying, reference this file using the `env_file` directive or by sourcing it before running compose.

Our `docker-compose.prod.yml` is configured to look for `${SECRETS_FILE}`.

**Deploy Command:**
```bash
export SECRETS_FILE=/home/deploy/aura-secrets.env
docker compose -f docker-compose.prod.yml up -d --build
```
