"""
Schemas for Chat functionality.

This module defines the Pydantic models used for chat-related API requests and responses.
"""

from pydantic import BaseModel
from typing import List, Optional


class Message(BaseModel):
    """
    Represents a single message in a chat conversation.

    Attributes:
        role (str): The role of the message sender (e.g., 'user', 'assistant', 'system').
        content (str): The text content of the message.
    """

    role: str
    content: str


class ChatRequest(BaseModel):
    """
    Schema for an incoming chat request.

    Attributes:
        messages (List[Message]): The history of messages in the conversation.
        conversation_id (Optional[str]): The unique ID of the conversation.
            If None, a new conversation is started.
    """

    messages: List[Message]
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    """
    Schema for the API response to a chat request.

    Attributes:
        reply (str): The assistant's generated response text.
        conversation_id (Optional[str]): The ID of the conversation this response belongs to.
    """

    reply: str
    conversation_id: Optional[str] = None
