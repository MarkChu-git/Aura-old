# Aura

<div align="center">

![Aura Logo](docs/images/logo.svg)

**AI-Driven Fragrance Imagery-to-Recommendation Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📖 Introduction

**Aura** is a sophisticated fragrance recommendation engine that bridges the gap between abstract olfactory descriptions and concrete product suggestions. By leveraging **Vector Search (pgvector)** and **Large Language Models (LLMs)**, Aura interprets nuanced user queries primarily based on imagery and mood—such as *"a fresh rainy morning in a pine forest"*—and maps them to a curated database of fragrances.

Unlike traditional keyword-based search (e.g., "floral perfume"), Aura understands the *vibe*, *atmosphere*, and *emotional context* of a scent, providing highly relevant and serendipitous discoveries for users.

## 🏗 Architecture

The system is built as a modern distributed application with a clear separation of concerns between the interactive frontend, the high-performance API layer, and the asynchronous data processing pipeline.

```mermaid
graph TD
    Client["User Client"] -->|HTTP/REST| Frontend["Frontend SPA (React)"]
    Frontend -->|API Requests| API["Backend API (FastAPI)"]
    
    subgraph Data Layer
        DB[("PostgreSQL + pgvector")]
        Redis[("Redis Cache/Queue")]
    end
    
    subgraph Compute
        API -->|Read/Write| DB
        API -->|Enqueue Jobs| Redis
        Worker["Celery Worker"] -->|Process Jobs| Redis
        Worker -->|Store Results| DB
    end
    
    subgraph AI Services
        Worker -->|Embeddings & Completion| LLM["OpenAI / External Models"]
    end
```

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Custom Design System (CSS3 Variables, Glassmorphism effects)
- **Icons**: Lucide React
- **Routing**: React Router

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (High-performance Async Python)
- **Database**: PostgreSQL 16 with `pgvector` extension for semantic search
- **ORM**: SQLAlchemy 2.0 (Async) + Alembic for migrations
- **Task Queue**: Celery + Redis for handling long-running AI inference tasks
- **AI Integration**: OpenAI API / Custom embeddings

### DevOps
- **Containerization**: Docker & Docker Compose
- **Linting & Formatting**: Black, Isort, ESLint

## 🚀 Deployment

For detailed instructions on deploying Aura securely to a production server (Linux + Docker Compose), please refer to the [Deployment Guide](DEPLOYMENT.md).

**Highlights:**
- ✅ **One-Command Bootstrap**: `./scripts/bootstrap.sh`
- ✅ **Secure by Default**: Strict database isolation & external secrets.
- ✅ **Maintenance**: Helpers for logs (`./scripts/logs.sh`) and updates (`./scripts/deploy.sh`).

## 🏃‍♂️ How to Run

There are two ways to run Aura: **Production Mode** (easiest, runs everything in Docker) and **Development Mode** (for editing code).

### 🐳 Option 1: Production Mode (Recommended)

Run the entire application (frontend, backend, db, redis) in containers.

**1. Start Services**
```bash
# Easy start script
./scripts/bootstrap.sh

# Or manually
docker compose -f docker-compose.prod.yml up -d
```

**2. Access Application**
- 🌍 **App URL**: [http://localhost](http://localhost) (Port 80)
- 🔌 **API**: `http://localhost/v1`
- 📘 **API Docs**: `http://localhost/docs` (if enabled in Nginx)

> **Note**: In this mode, the frontend is served on port **80**, not 5173.

---

### 💻 Option 2: Development Mode

Run the database in Docker, but run frontend and backend locally for hot-reloading.

**1. Start Database & Redis**
```bash
docker compose -f docker-compose.prod.yml up -d db redis
```

**2. Start Backend (Terminal 1)**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**3. Start Frontend (Terminal 2)**
```bash
cd frontend
npm install
npm run dev
```

**4. Access Development**
- 🎨 **Frontend**: [http://localhost:5173](http://localhost:5173) (Hot Reload)
- 🔌 **Backend**: [http://localhost:8000](http://localhost:8000)
- 📘 **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🚀 Deployment Guide

For deploying to a remote server (e.g., EC2, DigitalOcean):

**1. Prepare Server**
```bash
# Clone repo
git clone https://github.com/your-repo/aura.git
cd aura
```

**2. Configure Secrets**
```bash
# Copy example to production env
cp backend/.env.example backend/.env

# EDIT THIS FILE! Set strong passwords and API keys
nano backend/.env
```

**3. Launch**
```bash
./scripts/bootstrap.sh
```

**4. Verify**
Access `http://<your-server-ip>`

---

## 🛠 Common Commands

### Restart Services

To restart all services (useful after config changes):

```bash
# Restart everything
docker compose -f docker-compose.prod.yml restart

# Restart specific service (e.g. api)
docker compose -f docker-compose.prod.yml restart api
```

If you changed environment variables (`.env`), valid restart requires:

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Stop Services

```bash
docker compose -f docker-compose.prod.yml down
```

### View Logs

```bash
# View all logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f api
```

---

### Manual Production Build

If you prefer to build and run without Docker:

**Frontend:**
```bash
cd frontend
npm install
npm run build          # Creates optimized production build in dist/
npm run preview        # Preview production build locally
```

**Backend:**
```bash
cd backend

# Setup environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure for production
export ENV=prod
export DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname
export REDIS_URL=redis://host:6379/0

# Run migrations
alembic upgrade head

# Start with production server (Gunicorn)
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

---

### Troubleshooting

**"command not found: python"**
- Use `python3` instead of `python` on macOS/Linux

**"Docker daemon not running"**
- Start Docker Desktop application
- Or use `brew services start docker` on macOS

**"Python 3.14 compatibility issues"**
- Downgrade to Python 3.10-3.13: `brew install python@3.12`
- Create venv with specific version: `python3.12 -m venv venv`

**"Port already in use"**
- Frontend (5173): `lsof -ti:5173 | xargs kill -9`
- Backend (8000): `lsof -ti:8000 | xargs kill -9`

**Database migration fails**
- Ensure PostgreSQL is running: `docker compose ps`
- Reset database: `docker compose down -v && docker compose up -d db`
- Run migrations: `alembic upgrade head`


## 📂 Project Structure

```
aura/
├── backend/                # FASTAPI Python Backend
│   ├── app/
│   │   ├── api/            # API Route definitions
│   │   ├── core/           # Config, Security, Celery Factory
│   │   ├── db/             # Database models & sessions
│   │   ├── models/         # Pydantic Schemas
│   │   └── services/       # Business Logic & AI integration
│   ├── migrations/         # Alembic migration scripts
│   ├── tests/              # Pytest suite
│   └── requirements.txt
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── assets/         # Static assets
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page views
│   │   └── hooks/          # Custom React hooks
│   └── package.json
└── docker-compose.yml      # Service orchestration
```

## 🧪 Testing

### Backend
Runs `pytest` inside the docker container to ensure isolation.
```bash
docker compose exec api pytest
```

### Frontend
Linting check:
```bash
cd frontend
npm run lint
```

## 📄 License
This project is licensed under the MIT License.
