# Nginx & HTTPS Setup Guide

This guide explains how to set up Nginx as a reverse proxy with valid SSL certificates (Let's Encrypt) for Aura.

## 1. Install Certbot
On your Linux server (e.g., Ubuntu):

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

## 2. Generate Certificates
Stop any running web servers on port 80/443 before this step if necessary, or use the webroot plugin if Nginx is already running.

```bash
sudo certbot certonly --standalone -d your-domain.com
```

Certificates will be stored in `/etc/letsencrypt/live/your-domain.com/`.

## 3. Configure Nginx (Containerized)
The Aura `docker-compose.prod.yml` uses an internal Nginx container. However, for SSL termination, it is standard practice to run a **host-level Nginx** (or a separate proxy container like Traefik) that handles SSL and forwards HTTP traffic to the Aura container.

### Option A: Host-Level Nginx (Recommended)
Install Nginx on the host:
```bash
sudo apt install nginx
```

Create a config file `/etc/nginx/sites-available/aura`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        # Proxy to the Aura Container listening on localhost:8080 (example)
        # You will need to map port 8080:80 in docker-compose.prod.yml
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option B: Containerized SSL (Simplified)
If you want the Docker container to handle everything (only for simple setups):
1. Mount the `/etc/letsencrypt` volume into the `frontend` service.
2. Update `deploy/nginx/aura.conf` to listen on 443 and specify ssl paths.

## 4. Auto-Renewal
Certbot sets up a cron job automatically. Test it:
```bash
sudo certbot renew --dry-run
```
