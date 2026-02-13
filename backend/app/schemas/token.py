"""
Schemas for Authentication Tokens.

This module defines the Pydantic models used for JWT token generation and validation.
"""

from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """
    Schema for the authentication token response.

    Attributes:
        access_token (str): The JWT access token string.
        token_type (str): The type of token (typically "bearer").
    """
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """
    Schema for the payload contents of a decoded JWT token.

    Attributes:
        sub (Optional[int]): The subject of the token (usually the user ID).
    """
    sub: Optional[int] = None
