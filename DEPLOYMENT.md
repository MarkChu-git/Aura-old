# Production Deployment & Operations Guide

This document describes how to deploy, secure, and maintain the Aura platform in a production environment using **Traefik** as the global gateway.

## 🏗 Architecture

- **Global Gateway (Traefik)**: Listens on host ports 80/443. Manages SSL and routes traffic to containers.
- **Internal Proxy (Nginx)**: Runs inside the Aura stack to route between Frontend and Backend.
- **Frontend**: Static React files served by the internal Nginx.
- **Backend**: FastAPI + Celery Worker (internal network only).
- **Data**: PostgreSQL + Redis (internal network only).

## 🚀 Quick Start (Fresh Server)

### Phase 1: Server Initialization (One-Time)

1. **Stop Old Services**: Ensure port 80/443 are free (stop host Nginx/Apache).
2. **Install Gateway**:
   ```bash
   chmod +x scripts/install-global-gateway.sh
   ./scripts/install-global-gateway.sh
   ```
   *This sets up Traefik and the shared `proxy` network.*

### Phase 2: Deploy Aura

1. **Clone & Setup**
   ```bash
   git clone https://github.com/your-username/aura.git
   cd aura
   chmod +x scripts/*.sh
   ```

2. **Configure Secrets**
   ```bash
   touch backend/.env
   cat backend/.env.example >> backend/.env
   # EDIT the file with real keys!
   vim backend/.env
   ```

3. **Configure Domain**
   Edit `docker-compose.prod.yml` to set your domain:
   ```yaml
   - "traefik.http.routers.aura.rule=Host(`your-domain.com`)"
   ```

4. **Launch**
   ```bash
   ./scripts/deploy.sh
   ```

## 🔄 Updates & Maintenance

- **Deploy New Code**:
  ```bash
  ./scripts/deploy.sh --build
  ```

- **View Logs**:
  ```bash
  ./scripts/logs.sh [api|worker|nginx|frontend]
  ```

## 🔐 Security Hardening

### 1. Firewall (UFW)
Only allow essential ports.

```bash
sudo ufw default deny incoming
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# Do NOT open port 8080 - Traefik dashboard should not be publicly accessible
# If you need the dashboard, access it via SSH tunnel instead:
# ssh -L 8080:localhost:8080 user@your-server
sudo ufw enable
```

**⚠️ Security Note:** The Traefik dashboard is disabled by default in the installation script. Never expose port 8080 publicly, as it provides detailed information about your infrastructure that attackers could exploit.

### 2. SSL (HTTPS)
Traefik handles SSL **automatically** via Let's Encrypt.
- Ensure your domain DNS points to the server IP.
- Traefik will request a certificate on the first request.
- Certificates are stored in `~/traefik-gateway/acme.json`.

## 🔧 Troubleshooting

### 1. 502 Bad Gateway / 404 Not Found
- Check Traefik Dashboard: `http://<server-ip>:8080`
- Ensure the `proxy` network exists: `docker network ls`
- Check if Aura's Nginx container is healthy: `docker ps`

### 2. DeepSeek API 401 Unauthorized
- See [DeepSeek Troubleshooting](docs/troubleshooting/DEEPSEEK.md).
- Verify `DEEPSEEK_API_KEY` is set in your secrets file.

### Rollback
If a deployment fails, revert to the previous image:

```bash
git checkout <previous-commit-hash>
./scripts/deploy.sh --build
```
