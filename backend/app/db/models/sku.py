import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class SKU(Base):
    __tablename__ = "skus"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand = Column(String, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True) # perfume, wash, home
    intensity = Column(Integer, nullable=True) # 1-5
    tags = Column(JSON, nullable=True)
    url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
