from fastapi import APIRouter, HTTPException, Path
from uuid import UUID
from app.services.job_service import JobService
from app.core.errors import success_response

router = APIRouter()


@router.get("/{job_id}")
async def get_job_status(job_id: UUID = Path(..., title="The ID of the job to get")):
    job = await JobService.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return success_response(
        {
            "id": str(job.id),
            "status": job.status,
            "progress_step": job.progress_step,
            "error": (
                {"code": job.error_code, "message": job.error_message}
                if job.error_code
                else None
            ),
            "created_at": job.updated_at.isoformat() if job.updated_at else None,
        }
    )
