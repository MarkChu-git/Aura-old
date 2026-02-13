"""
Processing Result Model
-----------------------
This module defines the Result model, which stores the final output
of the AI processing pipeline.

Author: Aura Team
Created: 2024-01-01
"""

from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class Result(Base):
    """
    Result Database Model.
    
    Stores the final analysis results linked to a specific job.
    Includes extracted tags, scent direction, and a textual summary.
    """
    __tablename__ = "results"

    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), primary_key=True)
    """Foreign key to the Job. Also acts as the primary key (1-to-1 relationship)."""
    
    extracted_tags = Column(JSON, nullable=True)
    """JSON object containing tags extracted from the input."""
    
    scent_direction = Column(JSON, nullable=True)
    """JSON object describing the recommended scent direction/profile."""
    
    summary = Column(Text, nullable=True)
    """Generated textual summary or explanation."""
    
    created_at = Column(DateTime, default=datetime.utcnow)
    """Timestamp when the result was generated."""

    job = relationship("Job")
    """Relationship back to the Job model."""
