"""
Chat Service Layer
------------------
This module handles the core business logic for the chat functionality.
It manages message persistence, conversation context, AI adapter interaction,
and background tasks like title generation.

Author: Aura Team
Created: 2024-01-01
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Dict, Optional
from app.db.models.conversation import Conversation, Message as DBMessage
from app.schemas.chat import ChatResponse
from app.tasks.tasks import get_ai_adapter
from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)


class ChatService:
    """
    Service class for managing chat operations.
    """

    @staticmethod
    async def process_chat(
        db: AsyncSession,
        messages: List[Dict[str, str]],
        conversation_id: Optional[str],
        user_id: Optional[int],
        background_tasks: BackgroundTasks,
    ) -> ChatResponse:
        """
        Process a chat message from a user.

        1. Sends the message history to the AI adapter.
        2. Receives the AI response.
        3. Persists the conversation and messages to the database (if authenticated).
        4. Triggers background tasks (e.g., title generation).

        Args:
            db (AsyncSession): Database session.
            messages (List[Dict[str, str]]): List of message dicts (role, content).
            conversation_id (Optional[str]): ID of existing conversation (if any).
            user_id (Optional[int]): ID of the authenticated user (if any).
            background_tasks (BackgroundTasks): FastAPI background task manager.

        Returns:
            ChatResponse: Object containing the AI reply and conversation ID.

        Raises:
            ValueError: If conversation is not found or access is denied.
        """
        adapter = get_ai_adapter()

        # 1. Generate AI Response
        reply = await adapter.chat(messages)

        # 2. Persist to DB if authenticated
        if user_id:
            if not conversation_id:
                # Create New Conversation
                initial_title = "New Chat"
                db_conversation = Conversation(
                    user_id=user_id, title=initial_title, title_status="initial"
                )
                db.add(db_conversation)
                await db.flush()
                conversation_id = str(db_conversation.id)
            else:
                # Verify ownership
                result = await db.execute(
                    select(Conversation).where(
                        Conversation.id == conversation_id,
                        Conversation.user_id == user_id,
                    )
                )
                db_conversation = result.scalars().first()  # type: ignore
                if not db_conversation:
                    raise ValueError("Conversation not found or access denied")

            # Save Messages
            # User Msg (Last one)
            if messages and messages[-1]["role"] == "user":
                last_msg = messages[-1]
                db.add(
                    DBMessage(
                        conversation_id=conversation_id,
                        role="user",
                        content=last_msg["content"],
                    )
                )

            # AI Msg
            db.add(
                DBMessage(
                    conversation_id=conversation_id, role="assistant", content=reply
                )
            )
            await db.commit()

            # 3. Check & Trigger Title Generation
            # Pass full history (incoming + new reply)
            full_history = messages + [{"role": "assistant", "content": reply}]
            background_tasks.add_task(
                ChatService.check_and_trigger_title_gen,
                str(conversation_id),
                full_history,
            )

        return ChatResponse(reply=reply, conversation_id=conversation_id)

    @staticmethod
    async def check_and_trigger_title_gen(conversation_id: str, messages: List[Dict]):
        """
        Background task to update conversation title based on context.

        Logic:
        1. Checks if enough messages exist to generate a meaningful title.
        2. Checks if the title is still in 'initial' state.
        3. Uses the AI adapter to generate a concise title.
        4. Updates the database.

        Args:
            conversation_id (str): The conversation ID.
            messages (List[Dict]): The message history.
        """
        try:
            from app.db.session import AsyncSessionLocal
            from sqlalchemy import func

            async with AsyncSessionLocal() as session:
                # 1. Strict Signal Check (DB Count)
                # Count total messages in this conversation
                count_result = await session.execute(
                    select(func.count(DBMessage.id)).where(
                        DBMessage.conversation_id == conversation_id
                    )
                )
                total_messages = count_result.scalar()

                # User Requirement: "When chatbox has 2 conversations" (2 messages)
                if total_messages < 2:
                    return

                # 2. Status Check
                result = await session.execute(
                    select(Conversation).where(Conversation.id == conversation_id)
                )
                conv = result.scalars().first()
                if not conv:
                    return

                # Only update if status is 'initial' or looks like a default
                is_default = conv.title_status == "initial" or conv.title in [
                    "New Chat",
                    "Untitled",
                    "New chat",
                ]
                if not is_default:
                    # Allow *one* re-generation if it's generic "Untitled" even if status says generated?
                    # Strict user rule: "ensure every title is different".
                    # For now honor status.
                    return

                # 3. Context Retrieval (DB Fetch)
                # "Maximum context length" -> Fetch ALL
                msgs_result = await session.execute(
                    select(DBMessage)
                    .where(DBMessage.conversation_id == conversation_id)
                    .order_by(DBMessage.created_at.asc())
                )
                db_messages = msgs_result.scalars().all()

                # Convert to Dict for Adapter
                # We need strict format
                context_messages = [
                    {"role": m.role, "content": m.content} for m in db_messages
                ]

                # 4. Generate
                adapter = get_ai_adapter()
                new_title = await adapter.generate_title(context_messages)

                if new_title and new_title not in ["Untitled", "New Chat"]:
                    stmt = (
                        update(Conversation)
                        .where(Conversation.id == conversation_id)
                        .values(title=new_title, title_status="generated")
                    )
                    await session.execute(stmt)
                    await session.commit()
                    logger.info(f"Generated title for {conversation_id}: {new_title}")

        except Exception as e:
            logger.error(f"Title Gen Task Failed: {e}")
