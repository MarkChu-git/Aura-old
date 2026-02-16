"""
Celery Application Configuration.

This module initializes the Celery app instance and configures it for
asynchronous task processing using Redis as the broker and result backend.
"""

from celery import Celery
from app.core.config import settings

# Initialize Celery app
# 'worker' is the name of the module/app
celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.tasks"],
)

# Configure Celery settings
celery_app.conf.update(
    task_serializer="json",  # Serialize tasks as JSON
    accept_content=["json"],  # Accept only JSON content
    result_serializer="json",  # Serialize results as JSON
    timezone="UTC",  # Use UTC timezone
    enable_utc=True,  # Enable UTC
    task_track_started=True,  # Track when tasks start
)
