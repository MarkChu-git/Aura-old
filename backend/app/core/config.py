from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "AURA Backend"
    API_V1_STR: str = "/v1"
    ENV: str = "dev"

    DATABASE_URL: str
    REDIS_URL: str
    ADMIN_TOKEN: str
    MODEL_VERSION: str = "v1-mock"
    AI_ADAPTER_TYPE: str = "mock"

    # S3 Settings
    S3_ENDPOINT: Optional[str] = None
    S3_BUCKET: str = "aura-uploads"
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None

    # Security
    SECRET_KEY: str = "change-me-in-production-please-super-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # AI Provider (DeepSeek)
    DEEPSEEK_API_KEY: Optional[str] = None
    DEEPSEEK_MODEL: str = "deepseek-chat"

    # Google Authentication
    GOOGLE_CLIENT_ID: Optional[str] = None

    # Legacy/Optional
    SITE_URL: Optional[str] = "http://localhost:5173"

    SENTRY_DSN: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=True, extra="ignore"
    )


settings = Settings()  # type: ignore
