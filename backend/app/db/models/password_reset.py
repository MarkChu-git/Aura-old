"""
Password Reset Token Model
--------------------------
This module defines the model for storing password reset tokens.
These tokens are generated when a user requests a password reset and are short-lived.

Author: Aura Team
Created: 2024-01-01
"""

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func
from app.db.session import Base


class PasswordResetToken(Base):
    """
    Password Reset Token Model.

    Stores secure tokens for password recovery flows.
    """

    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    """Unique identifier for the token record."""

    user_id = Column(Integer, nullable=False, index=True)
    """ID of the user who requested the reset."""

    token = Column(String, unique=True, nullable=False, index=True)
    """The secure token string sent to the user via email."""

    expires_at = Column(DateTime(timezone=True), nullable=False)
    """Timestamp when the token expires."""

    used = Column(Boolean, default=False)
    """Flag to indicate if the token has already been consumed."""

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    """Timestamp when the reset request was made."""
