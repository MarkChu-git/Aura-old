"""
Job Service Layer
-----------------
This module handles the creation, retrieval, and status management of processing jobs.
It interacts with the database and initiates background processing via Celery tasks.

Author: Aura Team
Created: 2024-01-01
"""

from uuid import UUID
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.db.models.job import Job
from app.db.models.input import Input
from app.tasks.tasks import process_job


class JobService:
    """
    Service class for managing Job entities and their lifecycles.
    """

    @staticmethod
    async def create_job(
        input_type: str,
        text: Optional[str] = None,
        image_key: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> UUID:
        """
        Create a new job and enqueue it for processing.

        Args:
            input_type (str): Type of input ('text' or 'image').
            text (Optional[str]): Text content (if text input).
            image_key (Optional[str]): S3 object key (if image input).
            session_id (Optional[str]): User session ID.

        Returns:
            UUID: The ID of the created job.
        """
        async with AsyncSessionLocal() as db:
            # 1. Create Input
            new_input = Input(
                input_type=input_type,
                text_content=text,
                image_object_key=image_key,
                session_id=session_id,
            )
            db.add(new_input)
            await db.flush()  # Get ID

            # 2. Create Job
            new_job = Job(
                input_id=new_input.id, status="queued", progress_step="QUEUED"
            )
            db.add(new_job)
            await db.commit()

            # 3. Enqueue Celery Task
            # process_job.delay(str(new_job.id))
            # Note: In async fastapi, delay() is sync and might block slightly, but usually fine.
            # For robustness, we assume Celery is configured correctly.
            process_job.delay(str(new_job.id))

            return new_job.id  # type: ignore

    @staticmethod
    async def get_job(job_id: UUID):
        """
        Retrieve a job by its ID.

        Args:
            job_id (UUID): The unique identifier of the job.

        Returns:
            Job: The job object, or None if not found.
        """
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Job).where(Job.id == job_id))
            return result.scalars().first()

    @staticmethod
    async def mark_failed(job_id: UUID, error_code: str, error_message: str):
        """
        Mark a job as failed with an error message.
        
        This is typically called by background workers or error handlers.

        Args:
            job_id (UUID): The job ID.
            error_code (str): Short error code.
            error_message (str): Descriptive error message.
        """
        async with AsyncSessionLocal() as session:
            try:
                stmt = select(Job).where(Job.id == job_id)
                result = await session.execute(stmt)
                job = result.scalars().first()
                if job and job.status not in ["succeeded", "failed"]:
                    job.status = "failed"
                    job.error_code = error_code
                    job.error_message = error_message
                    job.finished_at = datetime.utcnow()
                    await session.commit()
            except Exception as e:
                print(f"Failed to mark job {job_id} as failed: {e}")

    @staticmethod
    async def check_timeouts(timeout_seconds: int = 120):
        """
        Check for and fail jobs that have exceeded the maximum execution time.
        
        This method is intended to be run as a periodic maintenance task.

        Args:
            timeout_seconds (int): Maximum allowed duration in seconds.
        """
        cutoff = datetime.utcnow() - timedelta(seconds=timeout_seconds)
        async with AsyncSessionLocal() as session:
            # Find jobs running and started before cutoff
            # OR queued and created before cutoff (if we want to timeout queued jobs too)
            stmt = select(Job).where(Job.status == "running", Job.started_at < cutoff)
            result = await session.execute(stmt)
            jobs = result.scalars().all()

            for job in jobs:
                job.status = "failed"
                job.error_code = "TIMEOUT"
                job.error_message = f"Job exceeded max duration of {timeout_seconds}s"
                job.finished_at = datetime.utcnow()
                session.add(job)

            if jobs:
                await session.commit()
