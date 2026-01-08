# Environment Configuration Security Guide

## 🎯 Recommended Approach

### Production Environment (Most Secure)
**Location**: `/home/deploy/aura-secrets.env`

```bash
# On your production server
sudo mkdir -p /home/deploy
sudo touch /home/deploy/aura-secrets.env
sudo chmod 600 /home/deploy/aura-secrets.env  # Only owner can read/write
sudo chown deploy:deploy /home/deploy/aura-secrets.env
```

**Benefits**:
- ✅ Completely outside the codebase
- ✅ Strict file permissions
- ✅ Cannot be accidentally committed to Git
- ✅ Centralized secret management

---

### Development Environment (Current Setup)
**Location**: `backend/.env`

**Benefits**:
- ✅ **Principle of Least Privilege**: Only backend services can access
- ✅ Frontend cannot access backend secrets
- ✅ Clear separation of concerns
- ✅ Protected by `.gitignore`

**Usage**:
```bash
# Backend services that need secrets
docker compose -f docker-compose.prod.yml
# → reads from backend/.env
```

---

## 🚫 Why NOT Root Directory `.env`?

**Location**: `/Users/mark/Aura/.env` (Not recommended)

**Issues**:
- ❌ Shared between frontend and backend (violates least privilege)
- ❌ Increases accidental exposure risk
- ❌ Blurs configuration boundaries
- ❌ No clear benefit over backend/.env

---

## 📋 Action Items

### 1. Clean Up Duplicate Configuration

You currently have **two** `.env` files:
```
/Users/mark/Aura/.env          # ❌ Remove this
/Users/mark/Aura/backend/.env  # ✅ Keep this
```

**Recommended cleanup**:
```bash
# Backup root .env (just in case)
cp .env .env.backup

# Remove root .env
rm .env

# Keep only backend/.env for development
# Use /home/deploy/aura-secrets.env for production
```

### 2. Update Configuration Files

**For Development** (already done ✅):
```yaml
# docker-compose.prod.yml
env_file:
  - ${SECRETS_FILE:-backend/.env}
```

**For Production**:
```bash
# Set environment variable before running docker compose
export SECRETS_FILE=/home/deploy/aura-secrets.env
./scripts/bootstrap.sh
```

### 3. Verify `.gitignore` Protection

Your `.gitignore` already protects both:
```gitignore
.env
.env.*
!.env.example
```

This ensures:
- ✅ `backend/.env` → ignored
- ✅ `.env` (root) → ignored  
- ✅ `.env.example` → tracked (templates only)

---

## 🔐 Security Best Practices

### File Permissions
```bash
# Development
chmod 600 backend/.env        # Only you can read/write

# Production
chmod 600 /home/deploy/aura-secrets.env
chown deploy:deploy /home/deploy/aura-secrets.env
```

### Access Control
| Environment | Location | Who Can Access |
|-------------|----------|----------------|
| **Production** | `/home/deploy/aura-secrets.env` | Only `deploy` user |
| **Development** | `backend/.env` | Only backend containers (via volume mount) |
| **Frontend** | ❌ None | Should use public env vars only |

### Environment Variable Scope

**Backend Only** (sensitive):
```bash
DEEPSEEK_API_KEY=sk-xxx
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ADMIN_TOKEN=xxx
```

**Frontend** (public, injected at build time):
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_ENABLE_ANALYTICS=false
```

---

## 📚 Summary

> [!IMPORTANT]
> **Keep `backend/.env` for development, use `/home/deploy/aura-secrets.env` for production.**

### Quick Decision Tree

```
Are you in production?
├─ YES → Use /home/deploy/aura-secrets.env
│         (outside codebase, strict permissions)
│
└─ NO (development) → Use backend/.env
                      (scoped to backend only)
```

### Next Steps

1. ✅ Remove root `.env` file (keep only `backend/.env`)
2. ✅ Verify `backend/.env` has correct permissions (600)
3. ✅ For production deployment, create `/home/deploy/aura-secrets.env`
4. ✅ Never commit `.env` files to Git (already protected)
