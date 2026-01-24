# Troubleshooting Guide

## Deployment Issues

### 1. API Health Check Failed (Connection Refused)

**Symptoms:**
- `./scripts/bootstrap.sh` fails with "WARNING: API health check failed."
- `curl http://localhost/health` returns 502 Bad Gateway.
- Nginx logs (`docker logs aura-nginx-1`) show `connect() failed (111: Connection refused)` connecting to an upstream IP (e.g., `172.19.0.x`).

**Cause:**
- **Stale DNS Cache:** Nginx caches the IP addresses of upstream containers (`api`, `frontend`) based on the `resolver ... valid=30s;` directive. If container IPs change (e.g., due to container recreation) and Nginx hasn't updated its cache or restarted, it tries to connect to the old IP.

**Solution:**
- **Restart Nginx:** This forces a DNS lookup of the upstream services.
  ```bash
  docker restart aura-nginx-1
  ```
- **Verify:**
  ```bash
  curl -v http://localhost/health
  ```
  Should return `{"status":"ok"}`.

### 2. Frontend API Calls Fail (404/502)

**Cause:**
- **Routing Mismatch:** Frontend expects `/v1/` prefix, but Nginx is configured differently, or vice versa.
- **Environment:** Check `frontend/src/config/env.js` defaults vs `VITE_API_BASE_URL`.

---

## Service Management

### Reboot Services
To fully restart the stack without losing data:

```bash
docker compose -f docker-compose.prod.yml restart
```

### View Logs
Check logs for a specific service:

```bash
docker compose -f docker-compose.prod.yml logs -f api
# or
docker logs aura-api-1
```
