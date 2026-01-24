from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

class Result(Base):
    __tablename__ = "results"

    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), primary_key=True)
    extracted_tags = Column(JSON, nullable=True)
    scent_direction = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job")
