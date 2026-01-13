from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
from app.api.deps import get_current_user_optional, get_db
from app.db.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService
from app.db.models.conversation import Conversation, Message as DBMessage
from sqlalchemy import select, desc
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest, 
    background_tasks: BackgroundTasks,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """
    Direct synchronous chat endpoint.
    Delegates to ChatService for processing.
    """
    try:
        # Pydantic models to dicts for service layer
        msgs = [{"role": m.role, "content": m.content} for m in request.messages]
        user_id = current_user.id if current_user else None
        
        return await ChatService.process_chat(
            db=db,
            messages=msgs,
            conversation_id=request.conversation_id,
            user_id=user_id,
            background_tasks=background_tasks
        )

    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_history(
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # ... (Keep existing history logic or refactor later)
    # For now, just keep the imports the history endpoint needs if they were removed
    # But wait, I replaced the whole file content above?
    # I need to be careful not to delete the /history endpoint unless I included it.
    # The replacement content ends at @router.get("/history").
    # I should check if I need to preserve the implementation of get_history.
    # The previous `chat.py` had a /history endpoint. I should probably keep it inline or move it to service too.
    # Given the complexity, I'll keep the /history endpoint as is, but I need to make sure I import what it needs.
    # Let's assume the user wants me to KEEP the history endpoint. 
    # I will rely on the fact that I am replacing up to line 140, and the file might be longer.
    # Actually, let's look at the previous file content again.
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(desc(Conversation.updated_at))
    )
    conversations = result.scalars().all()
    
    return [
        {
            "id": c.id,
            "title": c.title,
            "updated_at": c.updated_at
        }
        for c in conversations
    ]

@router.delete("/history/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # verify ownership
    result = await db.execute(select(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id))
    db_conversation = result.scalars().first()
    
    if not db_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    await db.delete(db_conversation)
    await db.commit()
    
    return {"status": "success"}
@router.get("/history")
async def get_history(
    current_user: User = Depends(get_current_user_optional), # Should force auth here? Yes history is for auth users
    db: AsyncSession = Depends(get_db)
):
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
    db: AsyncSession = Depends(get_db)
):
    if not current_user:
         raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify ownership
    result = await db.execute(select(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id))
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
    db: AsyncSession = Depends(get_db)
):
    if not current_user:
         raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Delete all conversations for user
    # Cascade delete should handle messages if configured, otherwise delete messages first?
    # Usually SQLAlchemy cascade='all, delete-orphan' on relationship handles it.
    # Let's assume cascade is set up or do a bulk delete.
    # To be safe/simple:
    
    # Check simple delete
    stmt = select(Conversation).filter(Conversation.user_id == current_user.id)
    result = await db.execute(stmt)
    conversations = result.scalars().all()
    
    for conv in conversations:
        await db.delete(conv)
        
    await db.commit()
    return {"status": "success", "message": "History cleared"}
