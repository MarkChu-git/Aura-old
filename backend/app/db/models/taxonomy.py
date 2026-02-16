"""
Taxonomy Model
--------------
This module defines the Taxonomy model, which manages classification systems
like emotions, temperature, and other descriptive attributes.

Author: Aura Team
Created: 2024-01-01
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class Taxonomy(Base):
    """
    Taxonomy Database Model.

    Represents a classification term within a specific type (e.g., 'joy' within 'emotion').
    Used for tagging and structuring product data.
    """

    __tablename__ = "taxonomy"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    """Unique identifier for the taxonomy term."""

    type = Column(String, nullable=False)
    """Category type (e.g., 'emotion', 'temperature', 'season')."""

    key = Column(String, nullable=False)
    """Unique key or slug for the term (e.g., 'joy')."""

    display_name = Column(String, nullable=False)
    """Human-readable name for display."""

    description = Column(Text, nullable=True)
    """Detailed description of what this term represents."""

    created_at = Column(DateTime, default=datetime.utcnow)
    """Timestamp when the term was created."""

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    """Timestamp of the last update."""
