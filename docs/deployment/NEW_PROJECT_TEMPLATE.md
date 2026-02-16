# New Project Deployment Template (Traefik)

This guide explains how to deploy a **NEW** project on the same server alongside Aura.

## 1. Create `docker-compose.yml`
In your new project's folder (e.g., `~/my-new-app`), use this template:

```yaml
services:
  # Your Web Service (e.g., Node, Python, Go)
  web:
    image: nginx:alpine  # Replace with your image
    restart: always
    
    # 1. Join the shared proxy network
    networks:
      - proxy
      
    # 2. Tell Traefik how to route traffic
    labels:
      - "traefik.enable=true"
      # DOMAIN CONFIGURATION
      - "traefik.http.routers.my-new-app.rule=Host(`new-app.com`)"
      - "traefik.http.routers.my-new-app.entrypoints=websecure"
      - "traefik.http.routers.my-new-app.tls.certresolver=myresolver"
      # PORT CONFIGURATION (Internal port your app listens on)
      - "traefik.http.services.my-new-app.loadbalancer.server.port=80"

# 3. Define the external network
networks:
  proxy:
    external: true
```

## 2. Deploy
Simply run:

```bash
docker compose up -d
```

## 3. Done!
- Traefik automatically detects the new container.
- It requests an SSL certificate for `new-app.com`.
- Your site is live at `https://new-app.com`.
