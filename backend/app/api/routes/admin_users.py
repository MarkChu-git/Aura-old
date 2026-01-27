from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.db.models.user import User
from app.db.models.user_message import UserMessage
from app.api.deps import get_current_admin_user
from app.core.errors import success_response

router = APIRouter()


class SendMessageRequest(BaseModel):
    content: str


class UserResponse(BaseModel):
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
async def list_users(
    skip: int = 0, limit: int = 50, _=Depends(get_current_admin_user)
):
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
                "created_at": u.created_at.isoformat() if u.created_at else None
            }
            for u in users
        ]
        return success_response(user_list)


@router.post("/{user_id}/ban")
async def ban_user(user_id: int, _=Depends(get_current_admin_user)):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.is_active = False
        await session.commit()
        return success_response({"message": "User banned successfully"})


@router.delete("/{user_id}/ban")
async def unban_user(user_id: int, _=Depends(get_current_admin_user)):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.is_active = True
        await session.commit()
        return success_response({"message": "User unbanned successfully"})


@router.post("/{user_id}/messages")
async def send_message(
    user_id: int, request: SendMessageRequest, _=Depends(get_current_admin_user)
):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        message = UserMessage(user_id=user_id, content=request.content)
        session.add(message)
        await session.commit()
        return success_response({"message": "Message sent successfully"})
