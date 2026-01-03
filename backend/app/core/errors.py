from typing import Any, Optional
from uuid import UUID, uuid4
from fastapi import Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.core.logging import request_id_context

class ErrorDetails(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None

class ErrorResponse(BaseModel):
    request_id: UUID
    error: ErrorDetails

class SuccessResponse(BaseModel):
    request_id: UUID
    data: Any

async def http_exception_handler(request: Request, exc: Exception):
    request_id = request_id_context.get() or getattr(request.state, "request_id", str(uuid4()))
    
    # Check if standard FastAPI HTTPException
    if hasattr(exc, "status_code"):
        status_code = exc.status_code
        detail = exc.detail
    else:
        status_code = 500
        detail = "Internal Server Error"
        
    return JSONResponse(
        status_code=status_code,
        content={
            "request_id": str(request_id),
            "error": {
                "code": str(status_code),
                "message": str(detail)
            }
        }
    )

def success_response(data: Any, request_id: Optional[UUID] = None) -> dict:
    return {
        "request_id": request_id or request_id_context.get() or str(uuid4()),
        "data": data
    }
