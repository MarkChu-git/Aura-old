import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    sku_id = Column(UUID(as_uuid=True), ForeignKey("skus.id"), nullable=True)
    action = Column(String, nullable=False) # like, dislike, save, click, buy
    created_at = Column(DateTime, default=datetime.utcnow)
