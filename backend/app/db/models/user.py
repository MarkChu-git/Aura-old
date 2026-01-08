from sqlalchemy import Boolean, Column, DateTime, Integer, String, Enum
from sqlalchemy.sql import func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for Google auth users
    role = Column(String, default="user") # 'admin', 'user'
    is_active = Column(Boolean, default=True)
    language = Column(String, default="en")  # User's preferred language: 'en', 'zh', 'ms'
    
    # Google authentication fields
    google_sub = Column(String, unique=True, nullable=True, index=True)  # Google stable user ID
    name = Column(String, nullable=True)  # User's full name from Google
    picture_url = Column(String, nullable=True)  # Profile picture URL from Google
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
