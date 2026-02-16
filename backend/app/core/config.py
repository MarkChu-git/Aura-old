"""
Configuration Management Module
-------------------------------
This module defines the application configuration settings using Pydantic's BaseSettings.
It handles environment variables, default values, and sensitive information management.

Author: Aura Team
Created: 2024-01-01
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """
    Application Settings Configuration.

    This class loads configuration from environment variables (checking .env file first).
    It defines all the configurable parameters for the application, including database connections,
    security keys, third-party API keys, and feature flags.
    """

    # Project Info
    PROJECT_NAME: str = "AURA Backend"
    """Name of the project."""

    API_V1_STR: str = "/v1"
    """API version prefix."""

    ENV: str = "dev"
    """Current environment (dev, staging, prod)."""

    # Database & Redis
    DATABASE_URL: str
    """PostgreSQL connection string."""

    REDIS_URL: str
    """Redis connection string for caching and task queues."""

    ADMIN_TOKEN: str
    """Static token for administrative access (legacy/backup)."""

    MODEL_VERSION: str = "v1-mock"
    """Version of the AI model to use."""

    AI_ADAPTER_TYPE: str = "mock"
    """Type of AI adapter to use (mock, real)."""

    # S3 Settings
    S3_ENDPOINT: Optional[str] = None
    """S3 compatible storage endpoint URL."""

    S3_BUCKET: str = "aura-uploads"
    """S3 bucket name for file uploads."""

    S3_ACCESS_KEY: Optional[str] = None
    """S3 access key ID."""

    S3_SECRET_KEY: Optional[str] = None
    """S3 secret access key."""

    # Security
    SECRET_KEY: str = "change-me-in-production-please-super-secret-key"
    """Secret key for JWT encoding and encryption. MUST be changed in production."""

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    """Expiration time for access tokens in minutes."""

    # AI Provider (DeepSeek)
    DEEPSEEK_API_KEY: Optional[str] = None
    """API key for DeepSeek AI service."""

    DEEPSEEK_MODEL: str = "deepseek-chat"
    """DeepSeek model identifier."""

    # Google Authentication
    GOOGLE_CLIENT_ID: Optional[str] = None
    """Google OAuth2 Client ID."""

    # Legacy/Optional
    SITE_URL: Optional[str] = "http://localhost:5173"
    """Frontend application URL for CORS and redirects."""

    SENTRY_DSN: Optional[str] = None
    """Sentry DSN for error tracking."""

    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=True, extra="ignore"
    )


# Instantiate settings to be imported by other modules
settings = Settings()  # type: ignore
