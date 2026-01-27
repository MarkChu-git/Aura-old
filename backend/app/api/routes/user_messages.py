from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.db.models.user import User
from app.db.models.user_message import UserMessage
from app.api.deps import get_current_active_user
from app.core.errors import success_response

router = APIRouter()


@router.get("")
async def get_user_messages(current_user: User = Depends(get_current_active_user)):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UserMessage)
            .filter(UserMessage.user_id == current_user.id)
            .order_by(UserMessage.created_at.desc())
        )
        messages = result.scalars().all()
        return success_response(
            [
                {
                    "id": m.id,
                    "content": m.content,
                    "is_read": m.is_read,
                    "created_at": m.created_at.isoformat(),
                }
                for m in messages
            ]
        )


@router.put("/{message_id}/read")
async def mark_message_read(
    message_id: int, current_user: User = Depends(get_current_active_user)
):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UserMessage).filter(UserMessage.id == message_id)
        )
        message = result.scalars().first()
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        if message.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        message.is_read = True
        await session.commit()
        return success_response({"message": "Message marked as read"})
