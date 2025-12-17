"""
PsyAntigravity Backend Application

Intelligent Psychological Assessment Platform
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan handler for startup and shutdown events.
    Initialize database connections and other resources here.
    """
    # Startup: Initialize connections
    print("🚀 PsyAntigravity Backend Starting...")
    yield
    # Shutdown: Clean up resources
    print("👋 PsyAntigravity Backend Shutting Down...")


app = FastAPI(
    title="PsyAntigravity API",
    description="智能心理测评平台 API - Intelligent Psychological Assessment Platform",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://frontend:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root() -> dict[str, str]:
    """
    Root endpoint - Health check and welcome message.
    """
    return {
        "message": "欢迎使用 PsyAntigravity 智能心理测评平台",
        "status": "healthy",
        "version": "0.1.0",
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    """
    Health check endpoint for container orchestration.
    """
    return {"status": "healthy"}
