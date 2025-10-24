"""Auth API endpoints"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase, supabase_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])

class SignupRequest(BaseModel):
    email: str
    password: str
    org_name: Optional[str] = None


@router.post("/signup")
async def signup(request: SignupRequest):
    """
    Complete signup flow:
    1. Create user in Supabase Auth
    2. Create organization
    3. Link user to organization
    """
    try:
        print(f"=== SIGNUP REQUEST ===")
        print(f"Email: {request.email}")

        # 1. Create user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to create user")

        user_id = auth_response.user.id
        print(f"✅ User created: {user_id}")

        # 2. Create organization (using admin client to bypass RLS)
        org_name = request.org_name or f"{request.email.split('@')[0]}'s Organization"

        print(f"Creating organization: {org_name}")

        org_result = supabase_admin.table("organizations").insert({
            "name": org_name
        }).execute()

        if not org_result.data:
            raise HTTPException(status_code=500, detail="Failed to create organization")

        org_id = org_result.data[0]["id"]
        print(f"✅ Organization created: {org_id}")

        # 3. Link user to organization (using admin client to bypass RLS)
        member_result = supabase_admin.table("organization_members").insert({
            "user_id": user_id,
            "organization_id": org_id,
            "role": "owner",
            "status": "active"
        }).execute()

        if not member_result.data:
            print(f"⚠️ Warning: Failed to link user to organization")

        print(f"✅ User linked to organization")
        print(f"=== SIGNUP COMPLETE ===")

        return {
            "success": True,
            "message": "Signup successful",
            "user": {
                "id": user_id,
                "email": request.email
            },
            "organization": {
                "id": org_id,
                "name": org_name
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ SIGNUP ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/setup-user-org")
async def setup_user_organization(user_id: str):
    """
    Manual endpoint to fix users who don't have an organization.
    Use this to fix existing users who signed up before this was implemented.
    """
    try:
        print(f"=== MANUAL SETUP USER ORG ===")
        print(f"User ID: {user_id}")

        # Check if user already has an organization
        existing = supabase.table("organization_members")\
            .select("organization_id, organizations(name)")\
            .eq("user_id", user_id)\
            .eq("status", "active")\
            .maybe_single()\
            .execute()

        if existing and existing.data:
            org_id = existing.data["organization_id"]
            print(f"✅ User already has organization: {org_id}")
            return {
                "success": True,
                "message": "User already has organization",
                "organization_id": org_id
            }

        # Get user email from auth
        try:
            user = supabase.auth.admin.get_user_by_id(user_id)
            user_email = user.user.email if user.user else "user"
        except:
            user_email = "user"

        # Create organization (using admin client to bypass RLS)
        org_name = f"{user_email.split('@')[0]}'s Organization"

        print(f"Creating organization: {org_name}")

        org_result = supabase_admin.table("organizations").insert({
            "name": org_name
        }).execute()

        if not org_result.data:
            raise HTTPException(status_code=500, detail="Failed to create organization")

        org_id = org_result.data[0]["id"]
        print(f"✅ Organization created: {org_id}")

        # Link user to organization (using admin client to bypass RLS)
        supabase_admin.table("organization_members").insert({
            "user_id": user_id,
            "organization_id": org_id,
            "role": "owner",
            "status": "active"
        }).execute()

        print(f"✅ User linked to organization")
        print(f"=== SETUP COMPLETE ===")

        return {
            "success": True,
            "message": "Organization created and linked",
            "organization_id": org_id,
            "organization_name": org_name
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ SETUP ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/organization")
async def get_user_organization(user_id: str):
    """
    Get user's organization ID.
    This is called by the frontend after login.
    """
    try:
        print(f"=== GET USER ORG ===")
        print(f"User ID: {user_id}")

        result = supabase.table("organization_members")\
            .select("organization_id, role, organizations(name)")\
            .eq("user_id", user_id)\
            .eq("status", "active")\
            .maybe_single()\
            .execute()

        if not result.data:
            print(f"❌ No organization found for user")
            return {
                "success": False,
                "message": "No organization found. Please contact support."
            }

        org_id = result.data["organization_id"]
        print(f"✅ Found organization: {org_id}")

        return {
            "success": True,
            "organization_id": org_id,
            "role": result.data["role"],
            "organization": result.data.get("organizations", {})
        }

    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test")
async def test_auth_route():
    return {"success": True, "message": "Auth route working!"}