"""
SKU Embedding Model
-------------------
This module defines the SKUEmbedding model, which stores vector embeddings
for products to enable semantic search and recommendation.

Author: Aura Team
Created: 2024-01-01
"""

from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from app.db.session import Base


class SKUEmbedding(Base):
    """
    SKU Embedding Database Model.

    Stores the vector representation of an SKU for similarity search.
    """

    __tablename__ = "sku_embeddings"

    sku_id = Column(UUID(as_uuid=True), ForeignKey("skus.id"), primary_key=True)
    """Foreign key to the SKU. Acts as primary key (1-to-1)."""

    embedding = Column(Vector(1536), nullable=False)
    """Vector embedding of the SKU description/features. 1536 dimensions (OpenAI standard)."""

    model_version = Column(String, nullable=False)
    """Version identifier of the embedding model used (e.g., 'text-embedding-3-small')."""

    updated_at = Column(DateTime, default=datetime.utcnow)
    """Timestamp when the embedding was last generated."""
