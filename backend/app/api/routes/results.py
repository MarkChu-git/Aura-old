from fastapi import APIRouter, HTTPException, Path
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import AsyncSessionLocal
from app.db.models.result import Result
from app.db.models.recommendation import Recommendation
from app.db.models.sku import SKU
from app.core.errors import success_response

router = APIRouter()

@router.get("/{job_id}")
async def get_job_result(job_id: UUID = Path(..., title="The ID of the job")):
    async with AsyncSessionLocal() as session:
        # Fetch Result
        result_q = await session.execute(select(Result).where(Result.job_id == job_id))
        result = result_q.scalars().first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Result not found or job not finished")

        # Fetch Recommendations with SKU loaded
        # Note: selectinload for async relationships
        recos_q = await session.execute(
            select(Recommendation)
            .where(Recommendation.job_id == job_id)
            .options(selectinload(Recommendation.sku))
            .order_by(Recommendation.rank)
        )
        recos = recos_q.scalars().all()

        recommendation_list = []
        for r in recos:
            recommendation_list.append({
                "sku": {
                    "id": str(r.sku.id),
                    "brand": r.sku.brand,
                    "name": r.sku.name,
                    "image_url": r.sku.image_url,
                    "url": r.sku.url,
                    "category": r.sku.category
                },
                "score": r.score,
                "reason_short": r.reason_short,
                "reason_long": r.reason_long
            })

    return success_response({
        "summary": result.summary,
        "extracted_tags": result.extracted_tags,
        "scent_direction": result.scent_direction,
        "recommendations": recommendation_list
    })
