"""
Main Application Entry Point.

This module initializes the FastAPI application, configures middleware (CORS, Request ID),
sets up exception handlers, and includes the main API router. It also provides basic
health check endpoints.
"""

from uuid import uuid4
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, request_id_context
from app.core.errors import http_exception_handler
from app.api.router import api_router

# Initialize Logging
print(f"DEBUG: REDIS_URL={settings.REDIS_URL}")
setup_logging()

# Create FastAPI app instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="API for the Aura AI Fragrance Discovery Platform",
    version="1.0.0",
)

# CORS configuration
# Allows requests from local development origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware for request_id
@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    """
    Middleware to assign a unique Request ID to each incoming request.
    
    This ID is added to the logging context and returned in the 'X-Request-ID' header,
    facilitating distributed tracing and log correlation.
    """
    request_id = str(uuid4())
    request.state.request_id = request_id
    token = request_id_context.set(request_id)
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
    finally:
        request_id_context.reset(token)


# Exception Handling
# Register the global exception handler for all unhandled exceptions
app.add_exception_handler(Exception, http_exception_handler)

# Routes
# Include the main API router with the version prefix
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    """
    Root endpoint.
    
    Returns:
        dict: Basic API information and links to documentation.
    """
    return {
        "message": "Welcome to AURA API",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint.
    
    Used by load balancers and monitoring systems to check if the API is responsive.
    
    Returns:
        dict: {"status": "ok"}
    """
    return {"status": "ok"}
