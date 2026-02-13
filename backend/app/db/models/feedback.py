"""
User Feedback Model
-------------------
This module defines the Feedback model, which tracks user interactions
and preferences regarding recommendations (e.g., likes, clicks).

Author: Aura Team
Created: 2024-01-01
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class Feedback(Base):
    """
    Feedback Database Model.
    
    Records explicit user actions on recommendations to improve future results.
    """
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    """Unique identifier for the feedback event."""
    
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    """ID of the job where the recommendation was shown."""
    
    sku_id = Column(UUID(as_uuid=True), ForeignKey("skus.id"), nullable=True)
    """ID of the product the user interacted with."""
    
    action = Column(String, nullable=False)
    """Type of interaction: 'like', 'dislike', 'save', 'click', 'buy'."""
    
    created_at = Column(DateTime, default=datetime.utcnow)
    """Timestamp when the feedback was recorded."""
