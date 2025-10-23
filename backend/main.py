from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import API_TITLE, API_DESCRIPTION, API_VERSION, CORS_ORIGINS, SUPABASE_URL
from routes import interview, health, project, finance, migration, orchestrator

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(interview.router)
app.include_router(project.router)
app.include_router(finance.router)
app.include_router(migration.router)
app.include_router(orchestrator.router)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting Project Lightning AI Service...")
    print(f"📡 Connected to Supabase: {SUPABASE_URL}")
    print("🤖 AI Interview Conductor: Ready")
    print("✅ Service operational!")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("👋 Shutting down AI Service...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )