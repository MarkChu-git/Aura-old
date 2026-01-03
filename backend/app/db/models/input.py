import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class Input(Base):
    __tablename__ = "inputs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    input_type = Column(String, nullable=False) # text, image
    text_content = Column(Text, nullable=True)
    image_object_key = Column(String, nullable=True)
    session_id = Column(String, nullable=True)
    locale = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
