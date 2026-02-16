"""
Chat Conversation Model
-----------------------
This module defines the Conversation and Message models, which store
chat histories between users and the AI assistant.

Author: Aura Team
Created: 2024-01-01
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid


class Conversation(Base):
    """
    Conversation Database Model.

    Represents a single chat session or thread. Contains metadata like title
    and status, and holds a collection of messages.
    """

    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    """Unique identifier (UUID string) for the conversation."""

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    """ID of the user who owns this conversation."""

    title = Column(String, nullable=True)
    """Display title of the conversation. Can be auto-generated or user-set."""

    title_status = Column(String, default="initial", nullable=False)
    """Status of the title generation (initial, generated, manual)."""

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    """Timestamp when the conversation started."""

    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
    """Timestamp of the last activity in the conversation."""

    # Relationships
    user = relationship("User", backref="conversations")
    """Relationship to the User model."""

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )
    """One-to-many relationship with messages."""


class Message(Base):
    """
    Message Database Model.

    Represents an individual message within a conversation.
    """

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    """Unique identifier for the message."""

    conversation_id = Column(
        String, ForeignKey("conversations.id"), nullable=False, index=True
    )
    """ID of the parent conversation."""

    role = Column(String, nullable=False)
    """Role of the message sender ('user' or 'assistant')."""

    content = Column(Text, nullable=False)
    """Content of the message."""

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    """Timestamp when the message was created."""

    conversation = relationship("Conversation", back_populates="messages")
    """Relationship back to the Conversation model."""
