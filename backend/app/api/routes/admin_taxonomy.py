from fastapi import APIRouter
from app.core.errors import success_response

router = APIRouter()


@router.get("")
async def list_taxonomy():
    # Placeholder for taxonomy listing
    return success_response([])
