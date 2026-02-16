"""
Storage Service Layer
---------------------
This module handles file storage operations, specifically generating presigned URLs
for secure client-side uploads to S3 (or a mock alternative).

Author: Aura Team
Created: 2024-01-01
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict
from uuid import uuid4
import boto3
from botocore.config import Config
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class StorageAdapter(ABC):
    """
    Abstract base class for storage adapters.
    Defines the interface for generating presigned upload URLs.
    """

    @abstractmethod
    def generate_presigned_url(
        self, filename: str, content_type: str
    ) -> Dict[str, str]:
        """
        Generate a presigned URL for uploading a file.

        Args:
            filename (str): Name of the file.
            content_type (str): MIME type of the file.

        Returns:
            Dict[str, str]: Dictionary containing 'upload_url' and 'object_key'.
        """
        pass


class MockStorageAdapter(StorageAdapter):
    """
    Mock implementation of StorageAdapter for development/testing.
    Does not interact with real S3.
    """

    def generate_presigned_url(
        self, filename: str, content_type: str
    ) -> Dict[str, str]:
        # Generate a safe object key
        ext = filename.split(".")[-1] if "." in filename else "bin"
        key = f"uploads/{uuid4()}.{ext}"

        # Return a fake URL that won't actually work for PUT but satisfies the contract
        # In a real local setup with MinIO, we would key off S3_ENDPOINT
        return {
            "upload_url": "https://mock.upload.url/put?key={key}",
            "object_key": key,
        }


class S3StorageAdapter(StorageAdapter):
    """
    AWS S3 implementation of StorageAdapter.
    Uses boto3 to generate real presigned URLs.
    """

    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            config=Config(signature_version="s3v4"),
            region_name="us-east-1",  # Default
        )
        self.bucket = settings.S3_BUCKET

    def generate_presigned_url(
        self, filename: str, content_type: str
    ) -> Dict[str, str]:
        # 1. Generate Key
        ext = filename.split(".")[-1] if "." in filename else "bin"
        key = f"uploads/{uuid4()}.{ext}"

        # 2. Generate Presigned URL
        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod="put_object",
                Params={"Bucket": self.bucket, "Key": key, "ContentType": content_type},
                ExpiresIn=3600,  # 1 hour
            )
            return {"upload_url": url, "object_key": key}
        except Exception as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            raise e


class StorageService:
    """
    Service class/Facade for storage operations.
    Automatically selects the appropriate adapter based on configuration.
    """

    _adapter: Optional[StorageAdapter] = None

    @classmethod
    def get_adapter(cls) -> StorageAdapter:
        """
        Factory method to get the singleton storage adapter instance.

        Returns:
            StorageAdapter: The configured storage adapter.
        """
        if cls._adapter is None:
            # Decide based on config
            if settings.S3_ACCESS_KEY and settings.S3_SECRET_KEY:
                logger.info("Initializing S3 Storage Adapter")
                cls._adapter = S3StorageAdapter()
            else:
                logger.warning("Initializing Mock Storage Adapter (S3 keys missing)")
                cls._adapter = MockStorageAdapter()
        return cls._adapter

    @staticmethod
    def validate_file(
        filename: str, content_type: str, size_bytes: Optional[int] = None
    ):
        """
        Validate file metadata before allowing upload.

        Args:
            filename (str): Name of the file.
            content_type (str): MIME type.
            size_bytes (Optional[int]): File size in bytes.

        Raises:
            ValueError: If file type is not allowed or file is too large.
        """
        ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
        MAX_SIZE = 5 * 1024 * 1024  # 5MB

        if content_type not in ALLOWED_TYPES:
            raise ValueError(
                f"Invalid content type: {content_type}. Allowed: {ALLOWED_TYPES}"
            )

        # Note: Size check here is trusting the client if passed.
        # Real S3 policy can enforce content-length-range.
        if size_bytes and size_bytes > MAX_SIZE:
            raise ValueError("File too large. Max size: 5MB")

    @classmethod
    def presign(cls, filename: str, content_type: str) -> Dict[str, str]:
        """
        Validate file and generate a presigned upload URL.

        Args:
            filename (str): Name of the file.
            content_type (str): MIME type.

        Returns:
            Dict[str, str]: Presigned URL and object key.
        """
        cls.validate_file(filename, content_type)
        adapter = cls.get_adapter()
        return adapter.generate_presigned_url(filename, content_type)
