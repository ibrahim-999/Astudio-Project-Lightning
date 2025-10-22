
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY
from typing import List, Dict, Any, Optional

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class DatabaseService:

    @staticmethod
    def create_interview(data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new interview record"""
        result = supabase.table("interviews").insert(data).execute()
        return result.data[0]

    @staticmethod
    def update_interview_status(interview_id: str, status: str):
        """Update interview status"""
        supabase.table("interviews").update({
            "status": status
        }).eq("id", interview_id).execute()

    @staticmethod
    def save_transcript(interview_id: str, speaker: str, message: str):
        """Save message to transcript"""
        supabase.table("interview_transcripts").insert({
            "interview_id": interview_id,
            "speaker": speaker,
            "message": message
        }).execute()

    @staticmethod
    def save_analysis(interview_id: str, analysis: Dict[str, Any]):
        """Save interview analysis"""
        analysis_data = {
            "interview_id": interview_id,
            "overall_score": analysis.get("overall_score"),
            "technical_score": analysis.get("technical_score"),
            "communication_score": analysis.get("communication_score"),
            "cultural_fit_score": analysis.get("cultural_fit_score"),
            "strengths": analysis.get("strengths", []),
            "weaknesses": analysis.get("weaknesses", []),
            "key_insights": analysis.get("key_insights"),
            "recommendation": analysis.get("recommendation"),
            "detailed_analysis": analysis.get("detailed_analysis")
        }
        supabase.table("interview_analysis").insert(analysis_data).execute()

    @staticmethod
    def get_interviews(organization_id: str) -> List[Dict[str, Any]]:
        """Get all interviews for organization"""
        result = supabase.table("interviews")\
            .select("*")\
            .eq("organization_id", organization_id)\
            .order("created_at", desc=True)\
            .execute()
        return result.data

    @staticmethod
    def get_interview_details(interview_id: str) -> Dict[str, Any]:
        interview = supabase.table("interviews")\
            .select("*")\
            .eq("id", interview_id)\
            .single()\
            .execute()

        transcripts = supabase.table("interview_transcripts")\
            .select("*")\
            .eq("interview_id", interview_id)\
            .order("timestamp")\
            .execute()

        analysis = supabase.table("interview_analysis")\
            .select("*")\
            .eq("interview_id", interview_id)\
            .execute()

        return {
            "interview": interview.data,
            "transcripts": transcripts.data,
            "analysis": analysis.data[0] if analysis.data else None
        }

    @staticmethod
    def test_connection() -> bool:
        try:
            supabase.table("organizations").select("id").limit(1).execute()
            return True
        except:
            return False


db = DatabaseService()