"""
Input Data Model
----------------
This module defines the Input model, which represents the raw user input
(text or image) submitted for processing.

Author: Aura Team
Created: 2024-01-01
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class Input(Base):
    """
    Input Database Model.
    
    Stores the raw input data received from the user before processing.
    This can be text content or a reference to an uploaded image.
    """
    __tablename__ = "inputs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    """Unique identifier for the input."""
    
    input_type = Column(String, nullable=False)
    """Type of input: 'text' or 'image'."""
    
    text_content = Column(Text, nullable=True)
    """Raw text content provided by the user (if input_type is 'text')."""
    
    image_object_key = Column(String, nullable=True)
    """S3 object key for the uploaded image (if input_type is 'image')."""
    
    session_id = Column(String, nullable=True)
    """Session identifier to track user sessions (optional)."""
    
    locale = Column(String, nullable=True)
    """Locale or language code of the input (e.g., 'en-US')."""
    
    created_at = Column(DateTime, default=datetime.utcnow)
    """Timestamp when the input was received."""
