"""
Schemas for User Management.

This module defines the Pydantic models used for user-related operations,
including registration, login, profile updates, and password management.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """
    Base schema for User data, containing common attributes.

    Attributes:
        email (Optional[EmailStr]): The user's email address.
        is_active (Optional[bool]): Whether the user's account is active. Defaults to True.
        role (str): The user's role (e.g., "user", "admin"). Defaults to "user".
        language (Optional[str]): The user's preferred language code. Defaults to "en".
    """
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    role: str = "user"
    language: Optional[str] = "en"


class UserCreate(UserBase):
    """
    Schema for creating a new user (Registration).

    Attributes:
        email (EmailStr): The user's email address (required).
        password (str): The user's raw password (required).
    """
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """
    Schema for user login credentials.

    Attributes:
        email (EmailStr): The user's email address.
        password (str): The user's password.
    """
    email: EmailStr
    password: str


class UserInDBBase(UserBase):
    """
    Base schema for a user stored in the database.
    Includes the database ID.

    Attributes:
        id (Optional[int]): The unique primary key of the user.
    """
    id: Optional[int] = None

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class User(UserInDBBase):
    """
    Schema for public user data returned by the API.
    Inherits all fields from UserInDBBase.
    """
    pass


class UserInDB(UserInDBBase):
    """
    Schema for internal user data, including the hashed password.
    
    Attributes:
        hashed_password (str): The hashed version of the user's password.
    """
    hashed_password: str


class PasswordChange(BaseModel):
    """
    Schema for a password change request.

    Attributes:
        old_password (str): The user's current password for verification.
        new_password (str): The new password to set.
    """
    old_password: str
    new_password: str


class PasswordResetRequest(BaseModel):
    """
    Schema for requesting a password reset (Forgot Password).

    Attributes:
        email (EmailStr): The email address of the account to reset.
    """
    email: EmailStr


class PasswordReset(BaseModel):
    """
    Schema for executing a password reset using a token.

    Attributes:
        token (str): The reset token received via email/link.
        new_password (str): The new password to set.
    """
    token: str
    new_password: str
