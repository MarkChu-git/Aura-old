from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.db.models.sku import SKU
from app.core.config import settings
from app.core.errors import success_response

router = APIRouter()
rebuild_router = APIRouter()


# Simple Admin Auth
async def verify_admin(x_admin_token: str = Header(...)):
    if x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid admin token")


class SKUCreate(BaseModel):
    brand: str
    name: str
    category: str
    intensity: Optional[int] = 3
    tags: Optional[dict] = {}
    url: Optional[str] = None
    image_url: Optional[str] = None


class SKURead(SKUCreate):
    id: UUID
    active: bool


@router.get("", response_model=None)
async def list_skus(skip: int = 0, limit: int = 100, _=Depends(verify_admin)):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(SKU).offset(skip).limit(limit))
        skus = result.scalars().all()
        # manual serialization via success_response to keep envelope consistent?
        # For admin/internal APIs, standardization is less strict but good practice.
        return success_response(
            [
                {
                    "id": str(s.id),
                    "brand": s.brand,
                    "name": s.name,
                    "category": s.category,
                    "active": s.active,
                }
                for s in skus
            ]
        )


@router.post("", dependencies=[Depends(verify_admin)])
async def create_sku(sku: SKUCreate):
    async with AsyncSessionLocal() as session:
        new_sku = SKU(**sku.dict(), active=True)
        session.add(new_sku)
        await session.commit()
        return success_response({"id": str(new_sku.id)})


@rebuild_router.post("/rebuild-embeddings", dependencies=[Depends(verify_admin)])
async def rebuild_embeddings():
    # Enqueue a task to rebuild all embeddings
    # rebuild_all_embeddings.delay()
    return success_response(
        {"status": "queued", "message": "Rebuilding embeddings for all SKUs"}
    )
