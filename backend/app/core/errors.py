"""
Error Handling and Response Standardization
-------------------------------------------
This module defines standard error responses and exception handlers for the API.
It ensures that all API responses follow a consistent structure, making it easier
for clients to handle errors and success states.

Author: Aura Team
Created: 2024-01-01
"""

from typing import Any, Optional
from uuid import UUID, uuid4
from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.core.logging import request_id_context


class ErrorDetails(BaseModel):
    """
    Structure for error details.

    Attributes:
        code (str): Error code (usually HTTP status or internal code).
        message (str): Human-readable error message.
        details (Optional[dict]): Additional context about the error.
    """

    code: str
    message: str
    details: Optional[dict] = None


class ErrorResponse(BaseModel):
    """
    Standard error response wrapper.

    Attributes:
        request_id (UUID): Unique ID of the request for tracing.
        error (ErrorDetails): The error details object.
    """

    request_id: UUID
    error: ErrorDetails


class SuccessResponse(BaseModel):
    """
    Standard success response wrapper.

    Attributes:
        request_id (UUID): Unique ID of the request for tracing.
        data (Any): The actual response payload.
    """

    request_id: UUID
    data: Any


async def http_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for HTTP exceptions.

    Intercepts exceptions, extracts the request ID (or generates one),
    and returns a standardized JSON response.

    Args:
        request (Request): The incoming HTTP request.
        exc (Exception): The raised exception.

    Returns:
        JSONResponse: Standardized error response.
    """
    # Retrieve or generate request ID
    request_id = request_id_context.get() or getattr(
        request.state, "request_id", str(uuid4())
    )

    # Check if standard FastAPI HTTPException
    if hasattr(exc, "status_code"):
        status_code = exc.status_code
        detail = getattr(exc, "detail", "Unknown Error")
    else:
        status_code = 500
        detail = "Internal Server Error"

    return JSONResponse(
        status_code=status_code,
        content={
            "request_id": str(request_id),
            "error": {"code": str(status_code), "message": str(detail)},
        },
    )


def success_response(data: Any, request_id: Optional[UUID] = None) -> dict:
    """
    Helper to construct a standardized success response dictionary.

    Args:
        data (Any): The payload to return.
        request_id (Optional[UUID]): Optional request ID. If None, retrieves from context or generates new.

    Returns:
        dict: The response dictionary matching SuccessResponse structure.
    """
    return {
        "request_id": request_id or request_id_context.get() or str(uuid4()),
        "data": data,
    }
