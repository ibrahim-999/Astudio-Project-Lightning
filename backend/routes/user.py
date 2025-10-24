"""
User API endpoints - Works with user_profiles table
"""
from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY

router = APIRouter(prefix="/api/user", tags=["user"])

def get_supabase():
    return create_client(SUPABASE_URL, SUPABASE_KEY)


@router.get("/organization")
async def get_user_organization(
    user_id: str,
    supabase = Depends(get_supabase)
):
    """
    Get the organization_id for a user
    """
    try:
        print(f"=== GET USER ORG REQUEST ===")
        print(f"User ID: {user_id}")

        # First try user_profiles table
        try:
            response = supabase.table("user_profiles")\
                .select("organization_id")\
                .eq("id", user_id)\
                .maybe_single()\
                .execute()

            print(f"user_profiles response: {response}")

            if response.data and response.data.get("organization_id"):
                org_id = response.data.get("organization_id")
                print(f"✅ Found org: {org_id}")
                return {
                    "success": True,
                    "organization_id": org_id
                }
        except Exception as e:
            print(f"❌ user_profiles check failed: {e}")

        # Fallback: try organization_members table
        try:
            response = supabase.table("organization_members")\
                .select("organization_id")\
                .eq("user_id", user_id)\
                .eq("status", "active")\
                .maybe_single()\
                .execute()

            print(f"organization_members response: {response}")

            if response.data and response.data.get("organization_id"):
                org_id = response.data.get("organization_id")
                print(f"✅ Found org in members: {org_id}")
                return {
                    "success": True,
                    "organization_id": org_id
                }
        except Exception as e:
            print(f"❌ organization_members check failed: {e}")

        # No organization found
        print(f"❌ NO ORG FOUND FOR USER: {user_id}")
        return {
            "success": False,
            "error": "No active organization found for user"
        }

    except Exception as e:
        print(f"❌ ERROR getting user organization: {e}")
        raise HTTPException(status_code=500, detail=str(e))