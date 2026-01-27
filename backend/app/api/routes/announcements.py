from fastapi import APIRouter
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.db.models.announcement import Announcement
from app.core.errors import success_response

router = APIRouter()


@router.get("")
async def get_active_announcements():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Announcement)
            .filter(Announcement.is_active)
            .order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
        )
        announcements = result.scalars().all()
        return success_response(
            [
                {
                    "id": a.id,
                    "title": a.title,
                    "content": a.content,
                    "is_pinned": a.is_pinned,
                    "created_at": a.created_at.isoformat(),
                }
                for a in announcements
            ]
        )
