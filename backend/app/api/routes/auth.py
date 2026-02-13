"""
Authentication API Routes
-------------------------
This module handles user authentication, registration, password management,
and user profile updates.

Author: Aura Team
Created: 2024-01-01
"""

from datetime import timedelta, datetime
from typing import Any
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core import security
from app.core.config import settings
from app.api.deps import get_db, get_current_active_user
from app.db.models.user import User
from app.schemas.token import Token
from app.schemas.user import (
    UserCreate,
    User as UserSchema,
    PasswordChange,
    PasswordResetRequest,
    PasswordReset,
)
from app.db.models.password_reset import PasswordResetToken

router = APIRouter()


@router.post("/login", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login.

    Authenticates a user using email and password, and returns a JWT access token.

    Args:
        db (AsyncSession): Database session.
        form_data (OAuth2PasswordRequestForm): Login credentials (username=email, password).

    Returns:
        dict: Access token and token type.
    
    Raises:
        HTTPException(401): If authentication fails.
        HTTPException(400): If user is inactive.
    """
    # Async query
    result = await db.execute(select(User).filter(User.email == form_data.username))
    user = result.scalars().first()

    if not user or not security.verify_password(
        form_data.password, str(user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/register", response_model=UserSchema)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> Any:
    """
    Register a new user.

    Creates a new user account if the email is not already taken and password requirements are met.

    Args:
        user_in (UserCreate): User registration data.
        db (AsyncSession): Database session.

    Returns:
        User: The created user object.

    Raises:
        HTTPException(400): If password is weak or user already exists.
    """
    # 1. Validate password strength
    if not security.validate_password_strength(user_in.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 10 characters and contain uppercase, lowercase, number, and special character.",
        )

    # 2. Check if user exists
    result = await db.execute(select(User).filter(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )

    # 3. Create user
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        role="user",  # Default role
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user profile.

    Args:
        current_user (User): The currently authenticated user.

    Returns:
        User: The user profile.
    """
    return current_user


@router.post("/change-password")
async def change_password(
    password_change: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Change password for current user.

    Verifies the old password and sets a new one.

    Args:
        password_change (PasswordChange): Old and new password data.
        current_user (User): The currently authenticated user.
        db (AsyncSession): Database session.

    Returns:
        dict: Success message.

    Raises:
        HTTPException(400): If old password is incorrect, new password is same as old, or new password is weak.
    """
    # 1. Verify old password
    if not security.verify_password(
        password_change.old_password, str(current_user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password"
        )

    # 2. Ensure new password is different
    if password_change.old_password == password_change.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from old password",
        )

    # 3. Validate new password strength
    if not security.validate_password_strength(password_change.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 10 characters and contain uppercase, lowercase, number, and special character.",
        )

    # 4. Update password
    current_user.hashed_password = security.get_password_hash(  # type: ignore
        password_change.new_password
    )
    await db.commit()

    return {"message": "Password updated successfully"}


@router.post("/forgot-password")
async def forgot_password(
    request: PasswordResetRequest, db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Request a password reset.

    Generates a password reset token for the given email (if exists).
    Note: In a production environment, this would send an email. Currently it returns the token for testing.

    Args:
        request (PasswordResetRequest): Request containing the email address.
        db (AsyncSession): Database session.

    Returns:
        dict: Success message and token information.
    """
    # 1. Find user
    result = await db.execute(select(User).filter(User.email == request.email))
    user = result.scalars().first()

    # Always return success to prevent user enumeration
    if not user:
        return {
            "message": "If an account with that email exists, a reset token has been generated",
            "token": None,
        }

    # 2. Generate secure token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    # 3. Save token to database
    reset_token = PasswordResetToken(
        user_id=user.id, token=token, expires_at=expires_at
    )
    db.add(reset_token)
    await db.commit()

    # 4. Return token (in production with email, this would be sent via email)
    return {
        "message": "Password reset token generated successfully",
        "token": token,
        "expires_at": expires_at.isoformat(),
        "note": "Copy this token and use it on the reset password page",
    }


@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordReset, db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Reset password using a valid token.

    Args:
        reset_data (PasswordReset): Token and new password.
        db (AsyncSession): Database session.

    Returns:
        dict: Success message.

    Raises:
        HTTPException(400): If token is invalid, expired, or used.
        HTTPException(404): If user associated with token is not found.
    """
    # 1. Find and validate token
    result = await db.execute(
        select(PasswordResetToken).filter(
            PasswordResetToken.token == reset_data.token,
            PasswordResetToken.used.is_(False),
        )
    )
    token_record = result.scalars().first()

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or already used reset token",
        )

    # 2. Check expiration
    if datetime.utcnow() > token_record.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired"
        )

    # 3. Validate new password
    if not security.validate_password_strength(reset_data.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 10 characters and contain uppercase, lowercase, number, and special character.",
        )

    # 4. Get user and update password
    result = await db.execute(select(User).filter(User.id == token_record.user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user.hashed_password = security.get_password_hash(reset_data.new_password)

    # 5. Mark token as used
    token_record.used = True  # type: ignore

    await db.commit()

    return {"message": "Password has been reset successfully"}


class LanguageUpdate(BaseModel):
    """Schema for updating user language preference."""
    language: str


@router.get("/language")
async def get_user_language(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user's language preference.

    Args:
        current_user (User): The currently authenticated user.

    Returns:
        dict: Language code (e.g., 'en', 'zh').
    """
    return {"language": current_user.language or "en"}


@router.put("/language")
async def update_user_language(
    language_update: LanguageUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update current user's language preference.

    Args:
        language_update (LanguageUpdate): New language code.
        current_user (User): The currently authenticated user.
        db (AsyncSession): Database session.

    Returns:
        dict: Success message and new language.

    Raises:
        HTTPException(400): If language code is invalid.
    """
    # Validate language code
    allowed_languages = ["en", "zh", "ms"]
    if language_update.language not in allowed_languages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid language. Allowed values: {', '.join(allowed_languages)}",
        )

    # Update user's language preference
    current_user.language = language_update.language  # type: ignore
    await db.commit()

    return {
        "message": "Language preference updated successfully",
        "language": current_user.language,
    }
