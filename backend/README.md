# AURA Backend

AI-driven fragrance imagery-to-recommendation platform backend.

## Tech Stack
- **Framework**: FastAPI
- **DB**: PostgreSQL + pgvector
- **Async**: Celery + Redis
- **Container**: Docker Compose

## Quick Start (Local)

1. **Setup Environment**:
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults work with docker-compose)
   ```

2. **Run Services**:
   ```bash
   docker compose up --build
   ```

3. **Run Migrations**:
   Open a new terminal:
   ```bash
   docker compose exec api alembic upgrade head
   ```

4. **Access API**:
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDOC: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Development workflow

### Database Migrations
Create a new migration:
```bash
docker-compose exec api alembic revision --autogenerate -m "description"
```
Apply migrations:
```bash
docker-compose exec api alembic upgrade head
```

### Testing
Run tests:
```bash
docker-compose exec api pytest
```

## API Usage Examples

### 1. Create a Job
```bash
curl -X POST "http://localhost:8000/v1/inputs/text" \
     -H "Content-Type: application/json" \
     -d '{"text": "A fresh rainy morning in a pine forest"}'
```
Response: `{"job_id": "uuid..."}`

### 2. Poll Status
```bash
curl "http://localhost:8000/v1/jobs/{job_id}"
```
Response: `{"status": "processing", "progress_step": "EMBEDDING", ...}`

### 3. Get Results
```bash
curl "http://localhost:8000/v1/results/{job_id}"
```
Response: `{"summary": "...", "recommendations": [...]}`

