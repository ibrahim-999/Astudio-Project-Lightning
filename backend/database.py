
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
        # ✅ Ensure scores are at least 1 (constraint likely requires 1-100)
        analysis_data = {
            "interview_id": interview_id,
            "overall_score": max(1, analysis.get("overall_score", 1)),
            "technical_score": max(1, analysis.get("technical_score", 1)),
            "communication_score": max(1, analysis.get("communication_score", 1)),
            "cultural_fit_score": max(1, analysis.get("cultural_fit_score", 1)),
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

    @staticmethod
    def create_project(data: Dict[str, Any]) -> Dict[str, Any]:
            result = supabase.table("projects").insert(data).execute()
            return result.data[0]

    @staticmethod
    def create_task(data: Dict[str, Any]) -> Dict[str, Any]:
            """Create new task"""
            result = supabase.table("tasks").insert(data).execute()
            return result.data[0]

    @staticmethod
    def get_projects(organization_id: str) -> List[Dict[str, Any]]:
            """Get all projects"""
            result = supabase.table("projects")\
                .select("*")\
                .eq("organization_id", organization_id)\
                .order("created_at", desc=True)\
                .execute()
            return result.data

    @staticmethod
    def get_project_tasks(project_id: str) -> List[Dict[str, Any]]:
            """Get tasks for a project"""
            result = supabase.table("tasks")\
                .select("*")\
                .eq("project_id", project_id)\
                .order("created_at")\
                .execute()
            return result.data

    @staticmethod
    def update_task(task_id: str, data: Dict[str, Any]):
            """Update task"""
            supabase.table("tasks").update(data).eq("id", task_id).execute()


    @staticmethod
    def create_expense(data: Dict[str, Any]) -> Dict[str, Any]:
                """Create new expense"""
                result = supabase.table("expenses").insert(data).execute()
                return result.data[0]

    @staticmethod
    def get_expenses(organization_id: str) -> List[Dict[str, Any]]:
                """Get all expenses"""
                result = supabase.table("expenses")\
                    .select("*")\
                    .eq("organization_id", organization_id)\
                    .order("expense_date", desc=True)\
                    .execute()
                return result.data

    @staticmethod
    def get_expense_summary(organization_id: str) -> Dict[str, Any]:
                """Get expense summary by category"""
                expenses = supabase.table("expenses")\
                    .select("category, amount")\
                    .eq("organization_id", organization_id)\
                    .execute()

                summary = {}
                total = 0

                for exp in expenses.data:
                    cat = exp.get('category', 'Other')
                    amt = float(exp.get('amount', 0))
                    summary[cat] = summary.get(cat, 0) + amt
                    total += amt

                return {
                    "by_category": summary,
                    "total": total
                }

    @staticmethod
    def get_user_organization(user_id: str) -> str:
            """Get user's organization_id"""
            result = supabase.table("user_profiles")\
            .select("organization_id")\
            .eq("id", user_id)\
            .single()\
            .execute()
            return result.data["organization_id"]

    def get_user_organization(self, user_id: str) -> str:
        """
        Get the organization_id for a user
        """
        try:
            response = self.supabase.table("organization_members")\
                .select("organization_id")\
                .eq("user_id", user_id)\
                .eq("status", "active")\
                .limit(1)\
                .maybe_single()\
                .execute()

            if response.data:
                return response.data.get("organization_id")
            return None
        except Exception as e:
            print(f"Error getting user organization: {e}")
            return None

db = DatabaseService()