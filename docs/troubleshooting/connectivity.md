# Troubleshooting Guide

## Deployment Issues

### 1. API Health Check Failed (404 Not Found or 502 Bad Gateway)

**Symptoms:**
- `./scripts/bootstrap.sh` fails with "WARNING: API health check failed."
- `curl http://localhost/health` returns 404 or 502.

**Cause:**
- **404 Not Found**: Traefik is running, but the `Host` header doesn't match your router rule.
  - *Fix*: Ensure your `docker-compose.prod.yml` labels include `Host('localhost')` or test with `curl -H "Host: your-domain.com" ...`.
- **502 Bad Gateway**: Traefik matches the rule, but cannot reach the internal Nginx container.
  - *Fix*: Ensure both `traefik` and `aura-nginx` are on the `proxy` network. Check `docker network inspect proxy`.
- **Connection Refused**: Traefik is not running.
  - *Fix*: Run `./scripts/install-global-gateway.sh`.

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
