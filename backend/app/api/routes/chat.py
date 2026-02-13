"""
Chat API Routes
---------------
This module provides endpoints for the conversational interface (chat).
It handles message processing, history retrieval, and conversation management.

Author: Aura Team
Created: 2024-01-01
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Optional
from app.api.deps import get_current_user_optional, get_db
from app.db.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService
from app.db.models.conversation import Conversation, Message as DBMessage
from sqlalchemy import select
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a message to the chat assistant.

    Delegates processing to the ChatService. Can be used anonymously or by authenticated users.

    Args:
        request (ChatRequest): The message content and context.
        background_tasks (BackgroundTasks): FastAPI background tasks.
        current_user (Optional[User]): The authenticated user (if any).
        db (AsyncSession): Database session.

    Returns:
        ChatResponse: The assistant's response.

    Raises:
        HTTPException(404): If referenced conversation is not found.
        HTTPException(500): If processing fails.
    """
    try:
        # Pydantic models to dicts for service layer
        msgs = [{"role": m.role, "content": m.content} for m in request.messages]
        user_id = int(current_user.id) if current_user else None

        return await ChatService.process_chat(
            db=db,
            messages=msgs,
            conversation_id=request.conversation_id,
            user_id=user_id,
            background_tasks=background_tasks,
        )

    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a specific conversation.

    Args:
        conversation_id (str): The ID of the conversation to delete.
        current_user (User): The authenticated user.
        db (AsyncSession): Database session.

    Returns:
        dict: Success status.

    Raises:
        HTTPException(401): If not authenticated.
        HTTPException(404): If conversation not found or doesn't belong to user.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # verify ownership
    result = await db.execute(
        select(Conversation).filter(
            Conversation.id == conversation_id, Conversation.user_id == current_user.id
        )
    )
    db_conversation = result.scalars().first()

    if not db_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.delete(db_conversation)
    await db.commit()

    return {"status": "success"}


@router.get("/history")
async def get_history(
    current_user: User = Depends(
        get_current_user_optional
    ),  # Should force auth here? Yes history is for auth users
    db: AsyncSession = Depends(get_db),
):
    """
    Get conversation history for the current user.

    Args:
        current_user (User): The authenticated user.
        db (AsyncSession): Database session.

    Returns:
        list[Conversation]: List of conversation objects.

    Raises:
        HTTPException(401): If not authenticated.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Fetch conversations
    # Limit to last 20?
    result = await db.execute(
        select(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    )
    conversations = result.scalars().all()
    return conversations


@router.get("/history/{conversation_id}")
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Get messages for a specific conversation.

    Args:
        conversation_id (str): The ID of the conversation.
        current_user (User): The authenticated user.
        db (AsyncSession): Database session.

    Returns:
        list[Message]: List of message objects in the conversation.

    Raises:
        HTTPException(401): If not authenticated.
        HTTPException(404): If conversation not found.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify ownership
    result = await db.execute(
        select(Conversation).filter(
            Conversation.id == conversation_id, Conversation.user_id == current_user.id
        )
    )
    db_conversation = result.scalars().first()
    if not db_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Fetch messages
    result_msgs = await db.execute(
        select(DBMessage)
        .filter(DBMessage.conversation_id == conversation_id)
        .order_by(DBMessage.created_at.asc())
    )
    messages = result_msgs.scalars().all()
    return messages


@router.delete("/history")
async def clear_history(
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Clear all conversation history for the current user.

    Args:
        current_user (User): The authenticated user.
        db (AsyncSession): Database session.

    Returns:
        dict: Success message.

    Raises:
        HTTPException(401): If not authenticated.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Delete all conversations for user
    # Cascade delete should handle messages if configured
    stmt = select(Conversation).filter(Conversation.user_id == current_user.id)
    result = await db.execute(stmt)
    conversations = result.scalars().all()

    for conv in conversations:
        await db.delete(conv)

    await db.commit()
    return {"status": "success", "message": "History cleared"}
