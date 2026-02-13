"""
Product Recommendation Model
----------------------------
This module defines the Recommendation model, which stores the specific
product suggestions generated for a user's request.

Author: Aura Team
Created: 2024-01-01
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, JSON, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class Recommendation(Base):
    """
    Recommendation Database Model.
    
    Stores a single recommended product for a specific job, including its
    relevance score and explanation.
    """
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    """Unique identifier for the recommendation."""
    
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    """ID of the job that generated this recommendation."""
    
    sku_id = Column(UUID(as_uuid=True), ForeignKey("skus.id"), nullable=False)
    """ID of the recommended product (SKU)."""
    
    rank = Column(Integer, nullable=False)
    """Ordering rank of the recommendation (1 = top match)."""
    
    score = Column(Float, nullable=False)
    """Similarity or relevance score (0.0 to 1.0)."""
    
    reason_short = Column(Text, nullable=True)
    """Brief explanation of why this product was recommended."""
    
    reason_long = Column(Text, nullable=True)
    """Detailed explanation of the match."""
    
    matched_tags = Column(JSON, nullable=True)
    """List of tags that matched the user's criteria."""
    
    created_at = Column(DateTime, default=datetime.utcnow)
    """Timestamp when the recommendation was generated."""

    job = relationship("Job")
    """Relationship to the Job model."""
    
    sku = relationship("SKU")
    """Relationship to the SKU model."""
