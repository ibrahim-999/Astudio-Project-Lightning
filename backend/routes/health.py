
from fastapi import APIRouter
from datetime import datetime
from database import db
from config import API_VERSION

router = APIRouter(tags=["health"])


@router.get("/")
async def root():
    return {
        "status": "operational",
        "service": "Project Lightning AI Service",
        "version": API_VERSION,
        "modules": {
            "hr": "active",
            "projects": "planned",
            "finance": "planned"
        }
    }


@router.get("/api/health")
async def health_check():
    database_healthy = db.test_connection()

    return {
        "status": "healthy" if database_healthy else "unhealthy",
        "database": "connected" if database_healthy else "disconnected",
        "ai_service": "ready",
        "timestamp": datetime.utcnow().isoformat()
    }