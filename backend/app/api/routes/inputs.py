"""
Input Handling Routes
---------------------
This module manages the ingestion of user inputs (text and images)
and initiates the processing pipeline.

Author: Aura Team
Created: 2024-01-01
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.job_service import JobService
from app.services.storage_service import StorageService
from app.core.errors import success_response

router = APIRouter()


class TextInputRequest(BaseModel):
    """Request schema for text input."""
    text: str
    session_id: Optional[str] = None
    locale: Optional[str] = "en-US"


class ImageInputRequest(BaseModel):
    """Request schema for image input (referencing uploaded object key)."""
    object_key: str
    session_id: Optional[str] = None


@router.post("/text")
async def create_text_job(payload: TextInputRequest):
    """
    Submit text input for processing.

    Creates a new job to analyze the provided text.

    Args:
        payload (TextInputRequest): The text content and metadata.

    Returns:
        dict: The ID of the created job.
    """
    job_id = await JobService.create_job(
        input_type="text", text=payload.text, session_id=payload.session_id
    )
    return success_response({"job_id": str(job_id)})


@router.post("/image")
async def create_image_job(payload: ImageInputRequest):
    """
    Submit image input for processing.

    Creates a new job to analyze the image (already uploaded to S3).

    Args:
        payload (ImageInputRequest): The S3 object key and metadata.

    Returns:
        dict: The ID of the created job.
    """
    job_id = await JobService.create_job(
        input_type="image", image_key=payload.object_key, session_id=payload.session_id
    )
    return success_response({"job_id": str(job_id)})


# Upload presign endpoint
@router.post("/image/presign")
async def presign_image_upload(filename: str, content_type: str):
    """
    Generate a presigned URL for image upload.

    Allows the frontend to upload images directly to S3 without passing through the backend.

    Args:
        filename (str): The name of the file to upload.
        content_type (str): The MIME type of the file.

    Returns:
        dict: Presigned URL and form fields.

    Raises:
        HTTPException(400): If input parameters are invalid.
        HTTPException(500): If generation fails.
    """
    try:
        result = StorageService.presign(filename, content_type)
        return success_response(result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        # Log unexpected error
        raise HTTPException(status_code=500, detail="Failed to generate upload URL")
