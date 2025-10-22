from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import Dict

from models import (
    InterviewStartRequest,
    InterviewResponseRequest,
    InterviewAnalysisRequest,
    InterviewResponse,
    AnalysisResponse,
    InterviewListResponse,
    InterviewDetailsResponse
)
from database import db
from interview_service import InterviewConductor

router = APIRouter(prefix="/api", tags=["interviews"])

active_interviews: Dict[str, InterviewConductor] = {}


@router.post("/interview/start", response_model=InterviewResponse)
async def start_interview(request: InterviewStartRequest):
    try:
        interview_data = {
            "organization_id": request.organization_id,
            "candidate_name": request.candidate_name,
            "candidate_email": request.candidate_email,
            "position": request.position,
            "status": "in_progress",
            "interview_date": datetime.utcnow().isoformat()
        }
        interview = db.create_interview(interview_data)
        interview_id = interview["id"]
        conductor = InterviewConductor(
            position=request.position,
            candidate_name=request.candidate_name
        )
        greeting = await conductor.start_interview()
        active_interviews[interview_id] = conductor
        db.save_transcript(interview_id, "ai", greeting)
        return InterviewResponse(
            success=True,
            interview_id=interview_id,
            ai_message=greeting,
            question_number=1,
            total_questions=conductor.max_questions
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interview/respond")
async def respond_to_interview(request: InterviewResponseRequest):
    try:
        interview_id = request.interview_id
        if interview_id not in active_interviews:
            raise HTTPException(
                status_code=404,
                detail="Interview session not found"
            )
        conductor = active_interviews[interview_id]
        db.save_transcript(interview_id, "candidate", request.candidate_response)
        result = await conductor.process_response(request.candidate_response)
        db.save_transcript(interview_id, "ai", result["ai_message"])
        if result["is_complete"]:
            db.update_interview_status(interview_id, "completed")
        return {
            "success": True,
            "ai_message": result["ai_message"],
            "question_number": result["question_number"],
            "total_questions": conductor.max_questions,
            "is_complete": result["is_complete"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interview/analyze", response_model=AnalysisResponse)
async def analyze_interview(request: InterviewAnalysisRequest):
    try:
        interview_id = request.interview_id
        if interview_id not in active_interviews:
            raise HTTPException(
                status_code=404,
                detail="Interview session not found"
            )
        conductor = active_interviews[interview_id]
        analysis = await conductor.analyze_interview()
        db.save_analysis(interview_id, analysis)
        del active_interviews[interview_id]
        return AnalysisResponse(
            success=True,
            analysis=analysis
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/interviews", response_model=InterviewListResponse)
async def get_interviews(organization_id: str):
    try:
        interviews = db.get_interviews(organization_id)
        return InterviewListResponse(
            success=True,
            interviews=interviews
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/interview/{interview_id}", response_model=InterviewDetailsResponse)
async def get_interview_details(interview_id: str):
    try:
        data = db.get_interview_details(interview_id)
        return InterviewDetailsResponse(
            success=True,
            **data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))