from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from app.db.session import Base

class SKUEmbedding(Base):
    __tablename__ = "sku_embeddings"

    sku_id = Column(UUID(as_uuid=True), ForeignKey("skus.id"), primary_key=True)
    embedding = Column(Vector(1536), nullable=False) # Assuming 1536 dims (OpenAI default), adjust if needed
    model_version = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)
