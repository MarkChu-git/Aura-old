from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.job_service import JobService
from app.services.storage_service import StorageService
from app.core.errors import success_response

router = APIRouter()

class TextInputRequest(BaseModel):
    text: str
    session_id: Optional[str] = None
    locale: Optional[str] = "en-US"

class ImageInputRequest(BaseModel):
    object_key: str
    session_id: Optional[str] = None

@router.post("/text")
async def create_text_job(payload: TextInputRequest):
    job_id = await JobService.create_job(
        input_type="text",
        text=payload.text,
        session_id=payload.session_id
    )
    return success_response({"job_id": str(job_id)})

@router.post("/image")
async def create_image_job(payload: ImageInputRequest):
    job_id = await JobService.create_job(
        input_type="image",
        image_key=payload.object_key,
        session_id=payload.session_id
    )
    return success_response({"job_id": str(job_id)})

# Upload presign endpoint
@router.post("/image/presign")
async def presign_image_upload(filename: str, content_type: str):
    try:
        result = StorageService.presign(filename, content_type)
        return success_response(result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        # Log unexpected error
        raise HTTPException(status_code=500, detail="Failed to generate upload URL")
