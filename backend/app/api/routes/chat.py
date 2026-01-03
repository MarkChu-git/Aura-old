from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.tasks.tasks import get_ai_adapter
from app.api.deps import get_current_user_optional, get_db
from app.db.models.user import User
from app.db.models.conversation import Conversation, Message as DBMessage
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    conversation_id: Optional[str] = None

@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest, 
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """
    Direct synchronous chat endpoint.
    Optionally Protected. Persists history if authenticated.
    """
    try:
        adapter = get_ai_adapter()
        # Convert pydantic models to dicts
        msgs = [{"role": m.role, "content": m.content} for m in request.messages]
        
        # 1. Generate AI Response
        reply = await adapter.chat(msgs)
        
        conversation_id = request.conversation_id

        # 2. Persist if User is authenticated
        if current_user:
            # Create or Retrieve Conversation
            if not conversation_id:
                # Create ne Conversation
                # Use first message or default as title
                title = msgs[0]['content'][:30] + "..." if msgs else "New Chat"
                db_conversation = Conversation(user_id=current_user.id, title=title)
                db.add(db_conversation)
                await db.flush() # flush to get ID
                conversation_id = db_conversation.id
            else:
                # Verify ownership
                result = await db.execute(select(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id))
                db_conversation = result.scalars().first()
                if not db_conversation:
                    # If not found or not owned, create new logic or error? 
                    # For simplicity, treat as new or error. Let's error 404 to define boundary.
                    # Or just create a new one to be safe user experience.
                    # Let's error 404 as "Conversation not found" is standard.
                    raise HTTPException(status_code=404, detail="Conversation not found")

            # Save User Message (The last one from the user)
            # Logic assumption: The request contains the FULL history or just the new message? 
            # The simple implementation usually sends the full context to build the prompt. 
            # But for saving, we only want to save the *new* messages.
            # However, simpler for now: Assume the LAST message in `msgs` is the new user input.
            if msgs and msgs[-1]['role'] == 'user':
                 last_user_msg = msgs[-1]
                 db_user_msg = DBMessage(
                     conversation_id=conversation_id,
                     role="user",
                     content=last_user_msg['content']
                 )
                 db.add(db_user_msg)

            # Save Assistant Response
            db_ai_msg = DBMessage(
                conversation_id=conversation_id,
                role="assistant",
                content=reply
            )
            db.add(db_ai_msg)
            await db.commit()

        return ChatResponse(reply=reply, conversation_id=conversation_id)
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        # await db.rollback() # Good practice
        raise HTTPException(status_code=500, detail=str(e))

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
