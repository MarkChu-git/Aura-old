"""
Security & Authentication Utilities
-----------------------------------
This module provides core security functions for the application, including
password hashing, verification, and JWT token generation.

It uses Passlib for password management and Python-JOSE for JWT operations.

Author: Aura Team
Created: 2024-01-01
"""

from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Configure password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Algorithm used for JWT encoding
ALGORITHM = "HS256"


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a new JWT access token.

    Args:
        subject (Union[str, Any]): The subject of the token (usually user ID or username).
        expires_delta (Optional[timedelta]): Custom expiration time. If not provided,
                                           uses the default from settings.

    Returns:
        str: The encoded JWT string.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Args:
        plain_password (str): The password provided by the user.
        hashed_password (str): The stored hashed password.

    Returns:
        bool: True if passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password for storage.

    Args:
        password (str): The plain password to hash.

    Returns:
        str: The hashed password string.
    """
    return pwd_context.hash(password)


def validate_password_strength(password: str) -> bool:
    """
    Validate that a password meets the required strength criteria.

    Criteria:
    - Minimum 10 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character

    Args:
        password (str): The password to validate.

    Returns:
        bool: True if valid, False otherwise.
    """
    import re

    if len(password) < 10:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True
