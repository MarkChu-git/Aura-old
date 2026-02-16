"""
Job Processing Model
--------------------
This module defines the Job model, which tracks the status and progress
of asynchronous processing tasks.

It also defines enumerations for JobStatus and JobStep.

Author: Aura Team
Created: 2024-01-01
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class JobStatus:
    """
    Enumeration of possible job statuses.
    """

    QUEUED = "queued"  # Job is waiting to be picked up
    RUNNING = "running"  # Job is currently being processed
    SUCCEEDED = "succeeded"  # Job completed successfully
    FAILED = "failed"  # Job failed with an error


class JobStep:
    """
    Enumeration of detailed processing steps.
    """

    QUEUED = "QUEUED"
    UNDERSTANDING = "UNDERSTANDING"  # Analyzing input intent
    EMBEDDING = "EMBEDDING"  # Generating vector embeddings
    RETRIEVING = "RETRIEVING"  # Searching vector database
    RERANKING = "RERANKING"  # Reranking search results
    EXPLAINING = "EXPLAINING"  # Generating final response
    DONE = "DONE"  # Process completed


class Job(Base):
    """
    Job Database Model.

    Represents an asynchronous processing task. Tracks the state machine
    of the AI processing pipeline, from input to final result.
    """

    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    """Unique identifier for the job."""

    input_id = Column(UUID(as_uuid=True), ForeignKey("inputs.id"), nullable=False)
    """Foreign key linking to the input data."""

    status = Column(String, default=JobStatus.QUEUED)
    """Current high-level status of the job (queued, running, succeeded, failed)."""

    progress_step = Column(String, default=JobStep.QUEUED)
    """Current granular processing step."""

    error_code = Column(String, nullable=True)
    """Error code if the job failed."""

    error_message = Column(String, nullable=True)
    """Descriptive error message if the job failed."""

    started_at = Column(DateTime, nullable=True)
    """Timestamp when processing started."""

    finished_at = Column(DateTime, nullable=True)
    """Timestamp when processing finished."""

    model_versions = Column(JSON, nullable=True)
    """Snapshot of model versions used for this job (for reproducibility)."""

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    """Timestamp of the last update to this record."""

    # Relationships
    input_rel = relationship("Input")
    """Relationship to the Input model."""
