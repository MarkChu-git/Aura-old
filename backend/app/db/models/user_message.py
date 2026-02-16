"""
User Message Model
------------------
This module defines the UserMessage model, which represents direct messages
or notifications sent to specific users.

Author: Aura Team
Created: 2024-01-01
"""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.sql import func
from app.db.session import Base


class UserMessage(Base):
    """
    User Message Database Model.

    Represents a private message sent to a specific user, usually by an admin
    or an automated system process.
    """

    __tablename__ = "user_messages"

    id = Column(Integer, primary_key=True, index=True)
    """Unique identifier for the message."""

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    """ID of the recipient user."""

    content = Column(Text, nullable=False)
    """Body content of the message."""

    is_read = Column(Boolean, default=False)
    """Status flag indicating if the user has read the message."""

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    """Timestamp when the message was sent."""
