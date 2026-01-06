# Production Deployment & Operations Guide

This document describes how to deploy, secure, and maintain the Aura platform in a production environment.

## 🏗 Architecture

- **Edge Proxy (Nginx)**: Listens on ports 80/443. Routes traffic to Frontend or API.
- **Frontend**: Static React files served by a lightweight internal Nginx.
- **Backend**: FastAPI + Celery Worker (internal network only).
- **Data**: PostgreSQL + Redis (internal network only).

## 🚀 Quick Start (Fresh Server)

1. **Clone & Setup**

   ```bash
   git clone https://github.com/your-username/aura.git
   cd aura
   
   # Copy scripts if they aren't executable
   chmod +x scripts/*.sh
   ```

2. **Configure Secrets**

   Create the secure secrets file:

   ```bash
   # Recommended location
   touch /home/deploy/aura-secrets.env
   chmod 600 /home/deploy/aura-secrets.env
   
   # Copy template content
   cat .env.example >> /home/deploy/aura-secrets.env
   # EDIT the file with real keys!
   vim /home/deploy/aura-secrets.env
   ```

3. **Bootstrap**

   Run the one-command setup:

   ```bash
   ./scripts/bootstrap.sh
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
sudo ufw enable
```

### 2. SSH Security

Edit `/etc/ssh/sshd_config`:
- `PermitRootLogin no`
- `PasswordAuthentication no` (Use SSH Keys)

### 3. Fail2Ban

Install to block brute-force attempts.

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## 🌐 HTTPS Setup (SSL)

We recommend using **Cloudflare** (Flexible/Full mode) for free SSL and WAF.

Alternatively, to use **Let's Encrypt** on the Edge Nginx:
1. Install Certbot on the host.
2. Generate certs: `certbot certonly --standalone -d your-domain.com`.
3. Mount `/etc/letsencrypt` into the `nginx` service in `docker-compose.prod.yml`.
4. Uncomment the 443 config in `deploy/nginx/aura.conf`.

## 🔧 Troubleshooting

### Common Issues

1. **502 Bad Gateway**:
   - The backend might still be starting. Check logs: `./scripts/logs.sh api`
   - Healthchecks in `docker-compose.prod.yml` prevent traffic until ready.

2. **Frontend Crashes**:
   - Ensure `frontend/nginx.conf` does NOT contain `upstream` blocks. It should be static only.

3. **DeepSeek API 401 Unauthorized**:
   - See [DeepSeek Troubleshooting](docs/troubleshooting/DEEPSEEK.md).
   - Verify `DEEPSEEK_API_KEY` is set in your secrets file.

### Rollback

If a deployment fails, revert to the previous image:

```bash
# Tag functionality not yet implemented in script, manually revert git:
git checkout <previous-commit-hash>
./scripts/deploy.sh --build
```
