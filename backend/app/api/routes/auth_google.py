"""
Google Authentication Routes
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models.user import User
from app.auth.google import verify_google_token, GoogleAuthError, EmailNotVerifiedError
from app.core.security import create_access_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token JWT


class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    provider: str = "google"

    class Config:
        from_attributes = True


class GoogleAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post(
    "/google", response_model=GoogleAuthResponse, status_code=status.HTTP_200_OK
)
async def google_auth(auth_data: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate user with Google ID token.

    - Verifies Google ID token
    - Creates or updates user record
    - Returns JWT access token
    """
    if not auth_data.credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credential"
        )

    try:
        # Verify Google token
        google_user = verify_google_token(auth_data.credential)

    except EmailNotVerifiedError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Google email not verified"
        )

    except GoogleAuthError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google credential"
        )

    # Find or create user by google_sub
    result = await db.execute(select(User).where(User.google_sub == google_user["sub"]))
    user = result.scalar_one_or_none()

    if user:
        # Update existing user info
        user.email = google_user["email"]
        user.name = google_user.get("name")
        user.picture_url = google_user.get("picture")
        await db.commit()
        await db.refresh(user)
        logger.info(f"Existing Google user logged in: {user.id}")
    else:
        # Create new user
        user = User(
            email=google_user["email"],
            google_sub=google_user["sub"],
            name=google_user.get("name"),
            picture_url=google_user.get("picture"),
            hashed_password=None,  # No password for Google auth
            role="user",
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info(f"New Google user created: {user.id}")

    # Generate JWT token
    if not user.id or not user.email:
        # Should not happen given schema constraints
        raise HTTPException(
            status_code=500, detail="User created with missing ID or email"
        )

    access_token = create_access_token(subject=user.id)

    return GoogleAuthResponse(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            picture=user.picture_url,
            provider="google",
        ),
    )
