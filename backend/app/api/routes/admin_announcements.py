"""
Admin Announcement Management Routes
------------------------------------
This module provides administrative endpoints for managing system announcements,
including creation, deletion, pinning, and visibility toggling.

Author: Aura Team
Created: 2024-01-01
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.db.models.announcement import Announcement
from app.api.deps import get_current_admin_user
from app.core.errors import success_response

router = APIRouter()


class AnnouncementCreate(BaseModel):
    """Schema for creating a new announcement."""
    title: str
    content: str


class AnnouncementResponse(BaseModel):
    """Schema for announcement details."""
    id: int
    title: str
    content: str
    is_active: bool
    is_pinned: bool
    created_at: str

    class Config:
        from_attributes = True


@router.get("", response_model=None)
async def list_announcements(_=Depends(get_current_admin_user)):
    """
    List all announcements (for admins).

    Args:
        _ (User): Ensures the requester is an admin.

    Returns:
        dict: List of announcement objects.
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Announcement).order_by(
                Announcement.is_pinned.desc(), Announcement.created_at.desc()
            )
        )
        announcements = result.scalars().all()
        announcement_list = [
            {
                "id": a.id,
                "title": a.title,
                "content": a.content,
                "is_active": a.is_active,
                "is_pinned": a.is_pinned,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in announcements
        ]
        return success_response(announcement_list)


@router.post("")
async def create_announcement(
    announcement: AnnouncementCreate, _=Depends(get_current_admin_user)
):
    """
    Create a new system announcement.

    Args:
        announcement (AnnouncementCreate): The announcement details.
        _ (User): Ensures the requester is an admin.

    Returns:
        dict: Success message.
    """
    async with AsyncSessionLocal() as session:
        new_announcement = Announcement(**announcement.model_dump(), is_active=True)
        session.add(new_announcement)
        await session.commit()
        return success_response({"message": "Announcement created successfully"})


@router.delete("/{announcement_id}")
async def delete_announcement(announcement_id: int, _=Depends(get_current_admin_user)):
    """
    Delete an announcement.

    Args:
        announcement_id (int): ID of the announcement to delete.
        _ (User): Ensures the requester is an admin.

    Returns:
        dict: Success message.

    Raises:
        HTTPException(404): If announcement not found.
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Announcement).filter(Announcement.id == announcement_id)
        )
        announcement = result.scalars().first()
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")
        await session.delete(announcement)
        await session.commit()
        return success_response({"message": "Announcement deleted successfully"})


@router.put("/{announcement_id}/toggle")
async def toggle_announcement(announcement_id: int, _=Depends(get_current_admin_user)):
    """
    Toggle the active status of an announcement.

    Args:
        announcement_id (int): ID of the announcement.
        _ (User): Ensures the requester is an admin.

    Returns:
        dict: Success message.

    Raises:
        HTTPException(404): If announcement not found.
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Announcement).filter(Announcement.id == announcement_id)
        )
        announcement = result.scalars().first()
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")
        announcement.is_active = not announcement.is_active
        await session.commit()
        return success_response({"message": "Announcement status updated"})


@router.put("/{announcement_id}/pin")
async def pin_announcement(announcement_id: int, _=Depends(get_current_admin_user)):
    """
    Pin or unpin an announcement.
    Only one announcement can be pinned at a time (logic might vary, here it unpins others).

    Args:
        announcement_id (int): ID of the announcement.
        _ (User): Ensures the requester is an admin.

    Returns:
        dict: Success message.

    Raises:
        HTTPException(404): If announcement not found.
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Announcement).filter(Announcement.id == announcement_id)
        )
        announcement = result.scalars().first()
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")

        result = await session.execute(
            select(Announcement).filter(Announcement.is_pinned)
        )
        other_pinned = result.scalars().all()

        if announcement.is_pinned:
            announcement.is_pinned = False
        else:
            for pinned_ann in other_pinned:
                pinned_ann.is_pinned = False
            announcement.is_pinned = True

        await session.commit()
        return success_response({"message": "Announcement pinned successfully"})
