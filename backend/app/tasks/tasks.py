import asyncio
from uuid import UUID
from datetime import datetime
from celery import shared_task
from app.db.session import AsyncSessionLocal
from app.db.models.job import Job, JobStatus, JobStep
from app.db.models.input import Input
from app.db.models.result import Result
from app.db.models.recommendation import Recommendation
from app.db.models.sku import SKU
from app.db.models.sku_embedding import SKUEmbedding
from app.db.models.sku_embedding import SKUEmbedding
from app.core.config import settings
from app.core.logging import job_id_context
from app.ai.mock_adapter import MockAIAdapter
from sqlalchemy import select, update
import logging

logger = logging.getLogger(__name__)

# Factory for adapter
def get_ai_adapter():
    if settings.DEEPSEEK_API_KEY:
        from app.ai.real_adapter import RealAIAdapter
        return RealAIAdapter()
    if settings.AI_ADAPTER_TYPE == "mock":
        return MockAIAdapter()
    return MockAIAdapter() # Fallback

async def process_job_async(job_id: str):
    adapter = get_ai_adapter()
    
    # Set Logging Context
    token = job_id_context.set(job_id)
    
    try:
        async with AsyncSessionLocal() as session:
            try:
                logger.info(f"Processing job {job_id}")
                job_uuid = UUID(job_id)

                # 1. Start (Queued -> Running)
                # We strictly check if it's already in terminal state to avoid zombies
                result = await session.execute(select(Job).where(Job.id == job_uuid))
                job = result.scalar_one_or_none()
                if not job:
                    logger.error(f"Job {job_id} not found")
                    return
                if job.status in [JobStatus.SUCCEEDED, JobStatus.FAILED]:
                    logger.warning(f"Job {job_id} already reached terminal state {job.status}")
                    return

                job.status = JobStatus.RUNNING
                job.progress_step = JobStep.UNDERSTANDING
                job.started_at = datetime.utcnow()
                await session.commit()

                # Fetch Input
                result_input = await session.execute(select(Input).where(Input.id == job.input_id))
                job_input = result_input.scalar_one()

                # 2. Extract Imagery
                try:
                    tags = await adapter.extract_imagery(text=job_input.text_content, image_key=job_input.image_object_key)
                except Exception as e:
                    raise ValueError("AI_EXTRACTION_FAILED") from e

                # Update Step
                job.progress_step = JobStep.EMBEDDING
                await session.commit()

                # 3. Embed
                try:
                    query_text = f"{tags.get('mood')} {tags.get('primary_scent_family')} {' '.join(tags.get('extracted_keywords', []))}"
                    embedding = await adapter.embed(query_text)
                except Exception as e:
                    raise ValueError("EMBEDDING_FAILED") from e

                # Update Step
                job.progress_step = JobStep.RETRIEVING
                await session.commit()

                # 4. Retrieval & Reranking (Merged for MVP)
                # Fallback for empty DB: just pick 3 random SKUs
                result_skus = await session.execute(select(SKU).limit(5))
                skus = result_skus.scalars().all()
                
                recommendations = []
                for i, sku in enumerate(skus):
                    explanation = await adapter.explain(sku.name, sku.tags or {}, tags)
                    rec = Recommendation(
                        job_id=job.id,
                        sku_id=sku.id,
                        rank=i+1,
                        score=0.9 - (i * 0.1), # Fake score
                        reason_short=explanation,
                        reason_long=explanation,
                        matched_tags={"common": ["fresh", "woody"]}
                    )
                    session.add(rec)
                    recommendations.append(rec)
                
                # Update Step
                job.progress_step = JobStep.EXPLAINING
                await session.commit()

                # 5. Save Result
                final_result = Result(
                    job_id=job.id,
                    extracted_tags=tags,
                    scent_direction={"primary": tags.get("primary_scent_family")},
                    summary=f"We analyzed your request for '{query_text}' and found these matches."
                )
                session.add(final_result)
                
                # 6. Success
                job.status = JobStatus.SUCCEEDED
                job.progress_step = JobStep.DONE
                job.finished_at = datetime.utcnow()
                await session.commit()
                logger.info(f"Job {job_id} succeeded")

            except Exception as e:
                logger.error(f"Job {job_id} failed: {e}")
                await session.rollback()
                
                # Re-fetch job to update status safely
                async with AsyncSessionLocal() as err_session:
                    stmt = select(Job).where(Job.id == UUID(job_id))
                    res = await err_session.execute(stmt)
                    err_job = res.scalar_one_or_none()
                    if err_job:
                        err_job.status = JobStatus.FAILED
                        err_job.finished_at = datetime.utcnow()
                        
                        # Determine Error Code
                        err_str = str(e)
                        if "AI_EXTRACTION_FAILED" in err_str:
                            err_job.error_code = "AI_EXTRACTION_FAILED"
                        elif "EMBEDDING_FAILED" in err_str:
                            err_job.error_code = "EMBEDDING_FAILED"
                        else:
                            err_job.error_code = "UNKNOWN_ERROR"
                        
                        err_job.error_message = str(e)
                        await err_session.commit()
    finally:
        job_id_context.reset(token)

@shared_task
def process_job(job_id: str):
    """
    Sync wrapper for async processing because Celery runs in a sync loop by default unless using specialized async pool.
    Standard approach: use asyncio.run
    """
    asyncio.run(process_job_async(job_id))
