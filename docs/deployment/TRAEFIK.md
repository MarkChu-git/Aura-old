# Global Traefik Gateway Setup

This guide explains how to set up the **Global Traefik Gateway** for Aura. This modern architecture allows you to host multiple projects on a single server with automatic HTTPS and zero-downtime deployments.

## 🏗 Architecture

Instead of managing Nginx config files manually, we use **Traefik** as the main entry point (Reverse Proxy) for the entire server.

- **Traefik (Gateway)**: Listens on ports `80` & `443`. Handles SSL termination (Let's Encrypt) and routing.
- **Aura (Project)**: Runs in its own containers. Does NOT expose ports to the host.
- **Docker Network (`proxy`)**: Connects Traefik to Aura (and other future projects).

## 🚀 One-Time Setup (Server Initialization)

You only need to do this **once per server**.

### 1. Run the Installer
We provide an automated script to set up Traefik:

```bash
./scripts/install-global-gateway.sh
```

This script will:
1. Create a shared Docker network named `proxy`.
2. Create a `~/traefik-gateway` directory.
3. Generate `docker-compose.yml` and `acme.json`.
4. Start the Traefik container.

### 2. Verify Installation
Check if Traefik is running:
```bash
docker ps | grep traefik
```

**⚠️ Security Note:** The Traefik dashboard is disabled by default for security. The dashboard can expose sensitive information about your infrastructure, including internal services, routes, and certificates. 

If you need to access the dashboard for troubleshooting:
1. Uncomment the `--api.dashboard=true` line in `~/traefik-gateway/docker-compose.yml`
2. Restart Traefik: `cd ~/traefik-gateway && docker compose restart`
3. Access via SSH tunnel (never expose publicly):
   ```bash
   ssh -L 8080:localhost:8080 user@your-server
   ```
4. Visit `http://localhost:8080` in your local browser
5. When done, disable the dashboard again and restart Traefik

---

## 📦 Deploying Aura (or any project)

Once the gateway is running, deploying Aura is simple.

### 1. Configure Domain
Edit `docker-compose.prod.yml` (or set env vars) to define your domain in the Traefik labels:

```yaml
services:
  nginx:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.aura.rule=Host(`aura.your-domain.com`)"
```

### 2. Start the Project
```bash
./scripts/deploy.sh
```

Traefik will detect the new container and automatically:
- Issue an SSL certificate.
- Route `https://aura.your-domain.com` to your container.

---

## 🔧 Troubleshooting

### "Gateway Timeout" or "404 Not Found"
1. Check if Traefik is running: `docker ps | grep traefik`
2. Check if Aura is connected to the `proxy` network:
   ```bash
   docker network inspect proxy
   ```
3. View Traefik logs:
   ```bash
   cd ~/traefik-gateway
   docker compose logs -f
   ```

### SSL Certificate Issues
- Traefik stores certificates in `~/traefik-gateway/acme.json`.
- Ensure your domain points to the server IP.
- Check logs for "acme" errors: `docker compose logs | grep acme`
