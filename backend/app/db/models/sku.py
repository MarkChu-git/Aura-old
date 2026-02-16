"""
SKU (Product) Model
-------------------
This module defines the SKU model, which represents a product item in the catalog.

Author: Aura Team
Created: 2024-01-01
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class SKU(Base):
    """
    SKU (Stock Keeping Unit) Database Model.

    Represents a specific product available in the system.
    Includes metadata like brand, name, category, and intensity.
    """

    __tablename__ = "skus"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    """Unique identifier for the SKU."""

    brand = Column(String, nullable=False)
    """Brand name of the product."""

    name = Column(String, nullable=False)
    """Name of the product."""

    category = Column(String, nullable=True)
    """Product category (e.g., 'perfume', 'wash', 'home')."""

    intensity = Column(Integer, nullable=True)
    """Scent intensity level (1-5 scale)."""

    tags = Column(JSON, nullable=True)
    """JSON list of descriptive tags associated with the product."""

    url = Column(String, nullable=True)
    """External URL to the product page."""

    image_url = Column(String, nullable=True)
    """URL to the product image."""

    active = Column(Boolean, default=True)
    """Whether the product is currently active and available."""

    created_at = Column(DateTime, default=datetime.utcnow)
    """Timestamp when the SKU was created."""

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    """Timestamp of the last update."""
