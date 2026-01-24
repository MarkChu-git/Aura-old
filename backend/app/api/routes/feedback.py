from fastapi import APIRouter
from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from app.db.session import AsyncSessionLocal
from app.db.models.feedback import Feedback
from app.core.errors import success_response

router = APIRouter()


class FeedbackRequest(BaseModel):
    job_id: UUID
    action: str
    sku_id: Optional[UUID] = None


@router.post("")
async def submit_feedback(payload: FeedbackRequest):
    async with AsyncSessionLocal() as session:
        fb = Feedback(
            job_id=payload.job_id, action=payload.action, sku_id=payload.sku_id
        )
        session.add(fb)
        await session.commit()

    return success_response({"ok": True})
