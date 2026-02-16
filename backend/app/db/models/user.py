"""
User Model Definition
---------------------
This module defines the User model, which represents registered users in the system.
It supports both traditional email/password authentication and Google OAuth2.

Author: Aura Team
Created: 2024-01-01
"""

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func
from app.db.session import Base


class User(Base):
    """
    User Database Model.

    Represents a user in the system. Handles authentication credentials,
    role-based access control, and user profile information.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    """Unique identifier for the user."""

    email = Column(String, unique=True, index=True, nullable=False)
    """User's email address. Must be unique."""

    hashed_password = Column(String, nullable=True)
    """Bcrypt hashed password. Nullable for users who sign up via Google OAuth."""

    role = Column(String, default="user")
    """User role (e.g., 'admin', 'user') for permission management."""

    is_active = Column(Boolean, default=True)
    """Flag to indicate if the account is active. False means suspended/banned."""

    language = Column(String, default="en")
    """User's preferred interface language (e.g., 'en', 'zh', 'ms')."""

    # Google authentication fields
    google_sub = Column(String, unique=True, nullable=True, index=True)
    """Google stable user ID (sub claim) for OAuth users."""

    name = Column(String, nullable=True)
    """User's full name retrieved from Google profile."""

    picture_url = Column(String, nullable=True)
    """URL to the user's Google profile picture."""

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    """Timestamp when the user account was created."""
