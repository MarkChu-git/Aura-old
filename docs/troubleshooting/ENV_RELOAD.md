# Docker Environment Variable Reload Guide

## 🚨 Remember This Rule

**After modifying `.env` files, you MUST use `down` + `up`, NOT just `restart`**

```bash
# ❌ Wrong - restart does NOT reload env files
docker compose restart

# ✅ Correct - completely recreates containers
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

---

## 📋 Common Scenarios

### Scenario 1: Updated API Key or Password
```bash
# 1. Edit config file
nano backend/.env

# 2. Must down + up
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# 3. Verify it loaded
docker compose -f docker-compose.prod.yml exec api env | grep DEEPSEEK
```

### Scenario 2: Modified Code Only (No Env Changes)
```bash
# Only restart needed
docker compose -f docker-compose.prod.yml restart api worker
```

### Scenario 3: DeepSeek API Error
```bash
# 1. Check logs
docker compose -f docker-compose.prod.yml logs api --tail 50 | grep -i error

# 2. Test API key
docker compose -f docker-compose.prod.yml exec -T api python3 << 'EOF'
import requests
from app.core.config import settings
r = requests.get("https://api.deepseek.com/v1/models",
                 headers={"Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}"})
print(f"Status: {r.status_code}")
if r.status_code != 200: print(r.text)
EOF

# 3. If 401 error → API key invalid, need to update
```

---

## 🔍 Quick Diagnosis Flow

### Step 1: Check Service Status
```bash
docker compose -f docker-compose.prod.yml ps
# All services should be "Up (healthy)"
```

### Step 2: View Error Logs
```bash
# API logs
docker compose -f docker-compose.prod.yml logs api --tail 30

# Worker logs
docker compose -f docker-compose.prod.yml logs worker --tail 30
```

### Step 3: Verify Environment Variables Loaded
```bash
docker compose -f docker-compose.prod.yml exec api python3 -c \
  "from app.core.config import settings; \
   print(f'DEEPSEEK_API_KEY: {settings.DEEPSEEK_API_KEY[:15]}...')"
```

### Step 4: Test DeepSeek Connection
```bash
docker compose -f docker-compose.prod.yml exec -T api python3 << 'EOF'
import asyncio
from app.ai.real_adapter import RealAIAdapter
async def test():
    adapter = RealAIAdapter()
    print(await adapter.chat([{'role': 'user', 'content': 'test'}]))
asyncio.run(test())
EOF
```

---

## 💡 Key Concepts

### Docker Compose Commands Comparison

| Command | Env Variables | Containers | Use Case |
|---------|---------------|------------|----------|
| `restart` | ❌ No reload | Restart existing | Code changes |
| `down` + `up` | ✅ Reload | Recreate | **Config changes** |
| `stop` + `start` | ❌ No reload | Stop/start existing | Temporary pause |

### When You Need down + up

✅ **Required** (config-related):
- Modified `.env` file
- Changed `docker-compose.yml`
- Updated environment variables
- Changed volume mappings

❌ **Not Required** (code-related):
- Python/Node code changes (with hot reload)
- Static file changes
- Service crashed, needs restart

---

## 🛠️ Complete Redeployment Flow

```bash
# 1. Update code/config
git pull
nano backend/.env  # if needed

# 2. Complete rebuild
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache  # optional
docker compose -f docker-compose.prod.yml up -d

# 3. Wait for health checks
sleep 45

# 4. Verify
curl -H "Host: aura.your-domain.com" http://localhost/health
docker compose -f docker-compose.prod.yml ps
```

---

## 📞 Optional Command Aliases

Add to your `~/.zshrc`:

```bash
# Aura project shortcuts
alias aura-restart="docker compose -f docker-compose.prod.yml restart api worker"
alias aura-reload="docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d"
alias aura-logs="docker compose -f docker-compose.prod.yml logs -f"
alias aura-status="docker compose -f docker-compose.prod.yml ps"
```

Usage:
```bash
source ~/.zshrc
aura-reload  # Reload environment variables
aura-logs api  # View API logs
```

---

## 🔗 Related Documentation

- Environment Security Guide: `docs/security/ENV_SECURITY.md`
- Bootstrap Script: `scripts/bootstrap.sh`
- Docker Compose Config: `docker-compose.prod.yml`
