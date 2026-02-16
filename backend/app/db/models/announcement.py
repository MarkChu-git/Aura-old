"""
Announcement Model
------------------
This module defines the Announcement model, which represents system-wide
broadcast messages visible to users.

Author: Aura Team
Created: 2024-01-01
"""

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func
from app.db.session import Base


class Announcement(Base):
    """
    Announcement Database Model.

    Represents a public announcement or notification from administrators to users.
    """

    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    """Unique identifier for the announcement."""

    title = Column(String(200), nullable=False)
    """Headline or title of the announcement."""

    content = Column(Text, nullable=False)
    """Full body text of the announcement."""

    is_active = Column(Boolean, default=True)
    """Whether the announcement is currently visible to users."""

    is_pinned = Column(Boolean, default=False)
    """Whether the announcement should be pinned to the top of the list."""

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    """Timestamp when the announcement was created."""
