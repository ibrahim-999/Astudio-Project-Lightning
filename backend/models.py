from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class InterviewStartRequest(BaseModel):
    candidate_name: str = Field(..., min_length=2)
    candidate_email: str = Field(..., min_length=5)
    position: str = Field(..., min_length=2)
    organization_id: str


class InterviewResponseRequest(BaseModel):
    interview_id: str
    candidate_response: str


class InterviewAnalysisRequest(BaseModel):
    interview_id: str


class InterviewResponse(BaseModel):
    success: bool
    interview_id: str
    ai_message: str
    question_number: int
    total_questions: int
    is_complete: Optional[bool] = False


class AnalysisResponse(BaseModel):
    success: bool
    analysis: Dict[str, Any]


class InterviewListResponse(BaseModel):
    success: bool
    interviews: List[Dict[str, Any]]


class InterviewDetailsResponse(BaseModel):
    success: bool
    interview: Dict[str, Any]
    transcripts: List[Dict[str, Any]]
    analysis: Optional[Dict[str, Any]]