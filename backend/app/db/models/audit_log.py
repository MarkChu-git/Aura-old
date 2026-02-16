"""
Audit Log Model
---------------
This module defines the AuditLog model, which tracks administrative actions
and security-critical events within the system.

Author: Aura Team
Created: 2024-01-01
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func
from app.db.session import Base


class AuditLog(Base):
    """
    Audit Log Database Model.

    Records actions taken by admins or system events for accountability and debugging.
    """

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    """Unique identifier for the audit log entry."""

    admin_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    """ID of the admin who performed the action. Null if system action."""

    action = Column(String(100), nullable=False, index=True)
    """Short code or description of the action (e.g., 'BAN_USER', 'CREATE_ANNOUNCEMENT')."""

    target_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    """ID of the user affected by the action, if applicable."""

    details = Column(Text, nullable=True)
    """JSON string or text providing additional context about the action."""

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    """Timestamp when the action occurred."""
