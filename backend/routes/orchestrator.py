"""
Unified AI Orchestrator API
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from orchestrator import UnifiedOrchestrator

router = APIRouter(prefix="/api/ai", tags=["orchestrator"])


class ChatRequest(BaseModel):
    message: str
    organization_id: Optional[str] = None
    conversation_history: Optional[List[Dict]] = []


class ChatResponse(BaseModel):
    success: bool
    message: str
    intent: Optional[Dict] = None
    data: Optional[Any] = None
    action_taken: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def unified_chat(request: ChatRequest):
    """
    Unified AI chat interface - handles all natural language commands
    """
    try:
        if not request.organization_id:
            raise HTTPException(
                status_code=400,
                detail="organization_id is required"
            )

        result = await UnifiedOrchestrator.process_command(
            request.message,
            request.organization_id,
            request.conversation_history
        )

        return ChatResponse(**result)

    except Exception as e:
        print(f"Error in orchestrator: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/capabilities")
async def get_capabilities():
    """
    Show what the AI can do
    """
    return {
        "success": True,
        "capabilities": {
            "finance": [
                "Add expenses from natural language",
                "View expense summaries",
                "Get budget insights"
            ],
            "projects": [
                "Create projects from descriptions",
                "Generate task breakdowns",
                "Track project status"
            ],
            "hr": [
                "Conduct AI interviews",
                "Analyze candidates",
                "Review interview history"
            ],
            "general": [
                "Answer questions",
                "Provide help",
                "General assistance"
            ]
        },
        "examples": [
            "Add expense: Coffee at Starbucks $5.50",
            "Create project for mobile app development",
            "Show me my recent expenses",
            "What projects do I have?",
            "Help me get started"
        ]
    }