#!/bin/bash
set -e

# ==========================================
# GLOBAL TRAEFIK GATEWAY INSTALLER
# ==========================================
# This script sets up a standalone, server-wide Traefik proxy.
# It is installed outside of your project folders so it persists
# even if you delete or move your project code.

INSTALL_DIR="$HOME/traefik-gateway"
NETWORK_NAME="proxy"
EMAIL="admin@your-domain.com" # CHANGE THIS

echo "🚀 Starting Global Traefik Gateway Setup..."

# 1. Create the shared Docker network
# All your future projects (Aura, Project B, etc.) will join this network.
if [ -z "$(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}")" ]; then
    echo "🌐 Creating shared network '${NETWORK_NAME}'..."
    docker network create ${NETWORK_NAME}
else
    echo "✅ Network '${NETWORK_NAME}' already exists."
fi

# 2. Prepare the installation directory
echo "📂 Setting up installation directory at ${INSTALL_DIR}..."
mkdir -p ${INSTALL_DIR}
cd ${INSTALL_DIR}

# 3. Create acme.json for SSL certificates (if not exists)
if [ ! -f acme.json ]; then
    echo "🔒 Creating acme.json for SSL certificates..."
    touch acme.json
    chmod 600 acme.json
fi

# 4. Generate the Docker Compose file
echo "📄 Generating docker-compose.yml..."
cat <<EOF > docker-compose.yml
services:
  traefik:
    image: traefik:v3.0
    container_name: traefik_gateway
    restart: always
    command:
      # API & Dashboard (disabled by default for security)
      # To enable: bind to localhost only and use SSH tunneling or VPN
      # - "--api.dashboard=true"
      
      # Docker Provider
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false" # Security: Only expose containers explicitly enabled
      - "--providers.docker.network=${NETWORK_NAME}"
      
      # EntryPoints
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      
      # HTTP -> HTTPS Redirect
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      
      # Let's Encrypt (SSL)
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=${EMAIL}"
      - "--certificatesresolvers.myresolver.acme.storage=/acme.json"
      
    ports:
      - "80:80"
      - "443:443"
      # Dashboard port removed for security. Use SSH tunneling if dashboard needed:
      # ssh -L 8080:localhost:8080 user@server
    
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./acme.json:/acme.json"
    
    networks:
      - ${NETWORK_NAME}

networks:
  ${NETWORK_NAME}:
    external: true
EOF

# 5. Start the Gateway
echo "🚀 Starting Traefik Gateway..."
docker compose up -d

echo ""
echo "✅ Global Traefik Gateway installed successfully!"
echo "-----------------------------------------------------"
echo "📂 Location:  ${INSTALL_DIR}"
echo "🔌 Network:   ${NETWORK_NAME}"
echo "-----------------------------------------------------"
echo "⚠️  Security: Dashboard is disabled by default."
echo "    To enable for troubleshooting, uncomment api.dashboard"
echo "    in docker-compose.yml and access via SSH tunnel:"
echo "    ssh -L 8080:localhost:8080 user@server"
echo "-----------------------------------------------------"
echo "Usage for your projects (e.g., Aura):"
echo "1. In docker-compose.yml, add external network:"
echo "   networks:"
echo "     default:"
echo "       name: ${NETWORK_NAME}"
echo "       external: true"
echo ""
echo "2. Add labels to your service:"
echo "   labels:"
echo "     - traefik.enable=true"
echo "     - traefik.http.routers.my-app.rule=Host(\`app.com\`)"
