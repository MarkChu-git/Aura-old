# Google Sign-In Setup Guide

## Overview

This guide explains how to set up Google Sign-In for the Aura project.

## Prerequisites

- Google Cloud Console access
- Backend and frontend configured according to project documentation

## Step 1: Create Google OAuth Client ID

### 1.1 Visit Google Cloud Console

Go to https://console.cloud.google.com/

### 1.2 Create or Select Project

1. Select your project or create a new one
2. Navigate to **APIs & Services** > **Credentials**

### 1.3 Create OAuth Client ID

1. Click **+ CREATE CREDENTIALS**
2. Select **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: Aura Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost` (development)
     - Your production domain
   - **Authorized redirect URIs**: Leave empty (not needed for ID token flow)

5. Click **CREATE**
6. Copy the **Client ID** (format: `xxxxx.apps.googleusercontent.com`)

## Step 2: Configure Backend

### 2.1 Update Environment Variables

Edit `backend/.env`:

```bash
# Add this line
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### 2.2 Install Dependencies

```bash
cd backend
docker compose -f docker-compose.prod.yml exec api pip install google-auth
```

### 2.3 Run Database Migration

```bash
docker compose -f docker-compose.prod.yml exec api python3 << 'EOF'
import asyncio
from app.db.session import async_engine
from alembic.config import Config
from alembic import command

async def migrate():
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")

asyncio.run(migrate())
EOF
```

Or manually:
```bash
cd backend
alembic upgrade head
```

### 2.4 Restart Backend Services

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## Step 3: Configure Frontend

### 3.1 Set Environment Variable

Create `frontend/.env` (if not exists):

```bash
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### 3.2 Rebuild Frontend

```bash
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

## Step 4: Testing

1. Open http://localhost/
2. Click **Sign In** button
3. You should see "Sign in with Google" button
4. Click it and complete Google sign-in
5. You should be logged in automatically

## Troubleshooting

### "Invalid Google credential" Error

- Verify `GOOGLE_CLIENT_ID` is correct in `backend/.env`
- Check that the Google Client ID matches the one in your Google Cloud Console
- Ensure JavaScript origin is authorized in Google Cloud Console

### Database Migration Fails

```bash
# Check current migration status
docker compose -f docker-compose.prod.yml exec api alembic current

# If needed, stamp the current version
docker compose -f docker-compose.prod.yml exec api alembic stamp head
```

### Frontend Not Showing Google Button

- Clear browser cache (Cmd+Shift+R)
- Check browser console for errors
- Verify Google Identity Services script is loaded in index.html

## Security Notes

- Never commit `GOOGLE_CLIENT_ID` to version control  
- Use different Client IDs for development and production
- Keep your Google Cloud console access secure

## API Documentation

### Endpoint

```
POST /v1/auth/google
```

### Request

```json
{
  "credential": "<google_id_token>"
}
```

### Response

```json
{
  "access_token": "<jwt_token>",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://...",
    "provider": "google"
  }
}
```

## Next Steps

- Implement Google Sign-In button in AuthModal.jsx  
- Add One Tap sign-in (optional)
- Configure button styling to match your design
