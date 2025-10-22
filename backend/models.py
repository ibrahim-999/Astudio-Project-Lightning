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

class ProjectCreateRequest(BaseModel):
    brief: str = Field(..., min_length=10)
    client_name: Optional[str] = None
    organization_id: str


class ProjectResponse(BaseModel):
    success: bool
    project: Dict[str, Any]
    tasks: List[Dict[str, Any]]


class TaskUpdateRequest(BaseModel):
    task_id: str
    status: Optional[str] = None
    assigned_to: Optional[str] = None


class ExpenseCreateRequest(BaseModel):
    description: str = Field(..., min_length=3)
    amount: float = Field(..., gt=0)
    expense_date: str
    vendor: Optional[str] = None
    project_id: Optional[str] = None
    organization_id: str


class ExpenseResponse(BaseModel):
    success: bool
    expense: Dict[str, Any]
    ai_category: Optional[str] = None
    confidence: Optional[float] = None
    ai_insights: Optional[str] = None
    categorization_model: Optional[str] = None
    analysis_model: Optional[str] = None
    tier: Optional[int] = None