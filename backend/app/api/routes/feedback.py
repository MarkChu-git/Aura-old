"""
Feedback Submission Routes
--------------------------
This module provides endpoints for users to submit feedback on recommendations.

Author: Aura Team
Created: 2024-01-01
"""

from fastapi import APIRouter
from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from app.db.session import AsyncSessionLocal
from app.db.models.feedback import Feedback
from app.core.errors import success_response

router = APIRouter()


class FeedbackRequest(BaseModel):
    """Schema for feedback submission."""
    job_id: UUID
    action: str
    sku_id: Optional[UUID] = None


@router.post("")
async def submit_feedback(payload: FeedbackRequest):
    """
    Submit user feedback.

    Args:
        payload (FeedbackRequest): Feedback details (job ID, action, SKU ID).

    Returns:
        dict: Success status.
    """
    async with AsyncSessionLocal() as session:
        fb = Feedback(
            job_id=payload.job_id, action=payload.action, sku_id=payload.sku_id
        )
        session.add(fb)
        await session.commit()

    return success_response({"ok": True})
