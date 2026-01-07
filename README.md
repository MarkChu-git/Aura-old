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

## 💻 Getting Started

### Prerequisites
- **Node.js** 18+ (frontend)
- **Python** 3.10-3.13 (backend) - *Note: Python 3.14+ is not yet supported by pydantic-core*
- **Docker** & **Docker Compose** (for database and Redis)
- **Git** (for cloning the repository)

### Quick Start (Recommended)

#### Development Mode

**1. Clone the Repository**
```bash
git clone https://github.com/your-repo/aura.git
cd aura
```

**2. Start Frontend (Terminal 1)**
```bash
cd frontend
npm install          # First time only
npm run dev         # Starts on http://localhost:5173
```

**3. Start Backend Services (Terminal 2)**
```bash
cd backend

# Create .env file from example
cp .env.example .env

# Start database and Redis with Docker
docker compose up -d db redis

# Create virtual environment (first time only)
python3 -m venv venv
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Run database migrations (first time only)
alembic upgrade head

# Start API server
uvicorn app.main:app --reload --port 8000
```

**4. Start Celery Worker (Terminal 3)** *(Optional, for AI features)*
```bash
cd backend
source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info
```

**Access Points:**
- 🎨 **Frontend**: [http://localhost:5173](http://localhost:5173)
- 🚀 **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 📖 **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Production Deployment

#### Using Docker Compose (Recommended)

**1. Prepare Environment**
```bash
cd aura

# Copy and configure production environment
cp backend/.env.example backend/.env
# Edit backend/.env - set secure passwords, API keys, etc.
```

**2. Run Bootstrap Script**
```bash
./scripts/bootstrap.sh
```

This script will:
- Build all Docker images
- Start all services (frontend, backend, database, Redis, Celery worker)
- Run database migrations
- Verify health of all services

**3. Access Production**
- Frontend: http://your-server-ip:3000
- Backend API: http://your-server-ip:8000

**4. View Logs**
```bash
./scripts/logs.sh
```

**5. Update Deployment**
```bash
./scripts/deploy.sh
```

For detailed production deployment instructions including SSL, domain setup, and security hardening, see [DEPLOYMENT.md](DEPLOYMENT.md).

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
