"""Auth API endpoints"""
from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/setup-user-org")
async def setup_user_organization(user_id: str):
    try:
        print(f"=== SETUP USER ORG ===")
        print(f"User ID: {user_id}")

        # Check if user already has an org
        existing = supabase.table("user_profiles")\
            .select("organization_id")\
            .eq("id", user_id)\
            .maybe_single()\
            .execute()

        # Fix: Check if existing.data is not None
        if existing and existing.data and existing.data.get("organization_id"):
            print(f"User already has org")
            return {
                "success": True,
                "message": "User already has organization",
                "organization_id": existing.data["organization_id"]
            }

        # Create organization
        org_name = f"User's Organization"
        print(f"Creating org: {org_name}")

        org_result = supabase.table("organizations").insert({
            "name": org_name
        }).execute()

        org_id = org_result.data[0]["id"]
        print(f"Created org: {org_id}")

        # Create user profile
        supabase.table("user_profiles").insert({
            "id": user_id,
            "organization_id": org_id,
            "role": "owner"
        }).execute()

        print(f"✅ Setup complete!")

        return {
            "success": True,
            "message": "Organization created",
            "organization_id": org_id
        }

    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test")
async def test_auth_route():
    return {"success": True, "message": "Auth route working!"}