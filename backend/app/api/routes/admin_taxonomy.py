"""
Admin Taxonomy Management Routes
--------------------------------
This module provides administrative endpoints for managing taxonomy terms.

Author: Aura Team
Created: 2024-01-01
"""

from fastapi import APIRouter
from app.core.errors import success_response

router = APIRouter()


@router.get("")
async def list_taxonomy():
    """
    List all taxonomy terms.
    
    Returns:
        dict: List of taxonomy terms (currently placeholder).
    """
    # Placeholder for taxonomy listing
    return success_response([])
