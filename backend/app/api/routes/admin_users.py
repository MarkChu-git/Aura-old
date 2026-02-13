"""
Admin User Management Routes
----------------------------
This module provides administrative endpoints for managing users,
including listing users, banning/unbanning users, and sending messages.

Author: Aura Team
Created: 2024-01-01
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.db.models.user import User
from app.db.models.user_message import UserMessage
from app.db.models.audit_log import AuditLog
from app.api.deps import get_current_admin_user
from app.core.errors import success_response

router = APIRouter()


class SendMessageRequest(BaseModel):
    """Schema for sending a message to a user."""
    content: str


class UserResponse(BaseModel):
    """Schema for user details in list view."""
    id: int
    email: str
    name: str | None
    role: str
    is_active: bool
    language: str
    google_sub: str | None
    picture_url: str | None

    class Config:
        from_attributes = True


@router.get("", response_model=None)
async def list_users(skip: int = 0, limit: int = 50, _=Depends(get_current_admin_user)):
    """
    List all users in the system.

    Args:
        skip (int): Number of records to skip (pagination).
        limit (int): Max number of records to return.
        _ (User): Ensures the requester is an admin.

    Returns:
        dict: List of user objects.
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).offset(skip).limit(limit).order_by(User.created_at.desc())
        )
        users = result.scalars().all()
        user_list = [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "role": u.role,
                "is_active": u.is_active,
                "language": u.language,
                "google_sub": u.google_sub,
                "picture_url": u.picture_url,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]
        return success_response(user_list)


@router.post("/{user_id}/ban")
async def ban_user(user_id: int, admin_user: User = Depends(get_current_admin_user)):
    """
    Ban a user by deactivating their account.
    Logs the action in the audit log.

    Args:
        user_id (int): ID of the user to ban.
        admin_user (User): The admin performing the action.

    Returns:
        dict: Success message.

    Raises:
        HTTPException(404): If user is not found.
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.is_active = False

        # Create audit log entry
        audit_log = AuditLog(
            admin_id=admin_user.id,
            action="ban_user",
            target_user_id=user_id,
            details=f"Admin {admin_user.email} banned user {user.email}",
        )
        session.add(audit_log)

        await session.commit()
        return success_response({"message": "User banned successfully"})


@router.delete("/{user_id}/ban")
async def unban_user(user_id: int, admin_user: User = Depends(get_current_admin_user)):
    """
    Unban a user by reactivating their account.
    Logs the action in the audit log.

    Args:
        user_id (int): ID of the user to unban.
        admin_user (User): The admin performing the action.

    Returns:
        dict: Success message.

    Raises:
        HTTPException(404): If user is not found.
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.is_active = True

        # Create audit log entry
        audit_log = AuditLog(
            admin_id=admin_user.id,
            action="unban_user",
            target_user_id=user_id,
            details=f"Admin {admin_user.email} unbanned user {user.email}",
        )
        session.add(audit_log)

        await session.commit()
        return success_response({"message": "User unbanned successfully"})


@router.post("/{user_id}/messages")
async def send_message(
    user_id: int, request: SendMessageRequest, _=Depends(get_current_admin_user)
):
    """
    Send a system message to a user.

    Args:
        user_id (int): ID of the recipient user.
        request (SendMessageRequest): Message content.
        _ (User): Ensures the requester is an admin.

    Returns:
        dict: Success message.

    Raises:
        HTTPException(404): If user is not found.
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        message = UserMessage(user_id=user_id, content=request.content)
        session.add(message)
        await session.commit()
        return success_response({"message": "Message sent successfully"})
