import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

class JobStatus:
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"

class JobStep:
    QUEUED = "QUEUED"
    UNDERSTANDING = "UNDERSTANDING"
    EMBEDDING = "EMBEDDING"
    RETRIEVING = "RETRIEVING"
    RERANKING = "RERANKING"
    EXPLAINING = "EXPLAINING"
    DONE = "DONE"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    input_id = Column(UUID(as_uuid=True), ForeignKey("inputs.id"), nullable=False)
    status = Column(String, default=JobStatus.QUEUED) 
    progress_step = Column(String, default=JobStep.QUEUED)
    error_code = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
    
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    model_versions = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    input_rel = relationship("Input")
