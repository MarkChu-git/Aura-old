import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, JSON, String, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    sku_id = Column(UUID(as_uuid=True), ForeignKey("skus.id"), nullable=False)
    rank = Column(Integer, nullable=False)
    score = Column(Float, nullable=False)
    reason_short = Column(Text, nullable=True)
    reason_long = Column(Text, nullable=True)
    matched_tags = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job")
    sku = relationship("SKU")
