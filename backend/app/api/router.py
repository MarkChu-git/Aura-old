from fastapi import APIRouter
from app.api.routes import inputs, jobs, results, chat, auth, auth_google, feedback, admin_skus, admin_taxonomy

api_router = APIRouter()

api_router.include_router(inputs.router, prefix="/inputs", tags=["inputs"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(results.router, prefix="/results", tags=["results"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(admin_skus.router, prefix="/admin/skus", tags=["admin"])
api_router.include_router(admin_taxonomy.router, prefix="/admin/taxonomy", tags=["admin"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(auth_google.router, prefix="/auth", tags=["auth"])


# Extra admin routes that don't fit CRUD neatly
api_router.include_router(admin_skus.rebuild_router, prefix="/admin", tags=["admin"])
