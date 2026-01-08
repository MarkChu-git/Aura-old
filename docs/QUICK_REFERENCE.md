# Quick Reference - Common Operations

## 🎯 Scenario 1: Update API Key or Password

```bash
# Step 1: Edit config file
nano backend/.env

# Step 2: Find the line to change, save after editing
# Press Ctrl+O to save, Enter to confirm, Ctrl+X to exit

# Step 3: Recreate containers (required!)
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Step 4: Wait 40 seconds for services to start

# Step 5: Verify
curl http://localhost/health
```

---

## 🎯 Scenario 2: View Logs for Errors

```bash
# View API errors
docker compose -f docker-compose.prod.yml logs api --tail 50 | grep -i error

# View Worker errors  
docker compose -f docker-compose.prod.yml logs worker --tail 50 | grep -i error

# View all logs in real-time
docker compose -f docker-compose.prod.yml logs -f
```

---

## 🎯 Scenario 3: Check Service Status

```bash
# View all container status
docker compose -f docker-compose.prod.yml ps

# Should see:
# ✅ aura-api-1        Up (healthy)
# ✅ aura-frontend-1   Up (healthy)
# ✅ aura-db-1         Up (healthy)
```

---

## 🎯 Scenario 4: Completely Restart All Services

```bash
# Stop and remove all containers
docker compose -f docker-compose.prod.yml down

# Rebuild and start
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Or use bootstrap script (one command)
./scripts/bootstrap.sh
```

---

## 🎯 Scenario 5: Verify DeepSeek API Works

```bash
# Quick test
docker compose -f docker-compose.prod.yml exec -T api python3 << 'EOF'
import asyncio
from app.ai.real_adapter import RealAIAdapter
async def test():
    adapter = RealAIAdapter()
    result = await adapter.chat([{'role': 'user', 'content': 'hello'}])
    print(f'✅ Response: {result}')
asyncio.run(test())
EOF
```

---

## 🎯 Scenario 6: Git Operations (Prevent Committing .env)

```bash
# Check before committing
git status

# If you see .env file (shouldn't happen)
git reset backend/.env  # Unstage

# Normal commit workflow
git add .
git commit -m "your message"
git push

# .env files should never appear in git status
```

---

## 📋 Quick Diagnosis Checklist

When encountering issues, check in order:

1. **Service Status**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

2. **API Logs**
   ```bash
   docker compose -f docker-compose.prod.yml logs api --tail 30
   ```

3. **Environment Variables**
   ```bash
   docker compose -f docker-compose.prod.yml exec api env | grep DEEPSEEK
   ```

4. **API Connectivity**
   ```bash
   curl http://localhost/health
   ```

5. **DeepSeek API**
   ```bash
   # See Scenario 5 above
   ```

---

## ⚡ Common Commands Quick Reference

| Need | Command |
|------|---------|
| After config change | `down` → `up -d` |
| After code change only | `restart api worker` |
| View logs | `logs api --tail 50` |
| View status | `ps` |
| Complete rebuild | `down` → `build` → `up -d` |
| One-click deploy | `./scripts/bootstrap.sh` |

Prefix all commands with: `docker compose -f docker-compose.prod.yml`

---

## 💡 Remember These 3 Core Operations

1. **Change .env → `down` + `up`** (most common)
2. **Change code → `restart`** (during development)
3. **Having issues → `logs` to check** (diagnosis)
