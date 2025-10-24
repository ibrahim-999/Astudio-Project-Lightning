import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

CORS_ORIGINS = ["http://localhost:3000"]
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

API_VERSION = "1.0.0"
API_TITLE = "Project Lightning AI Service"
API_DESCRIPTION = "AI orchestration for AI-native ERP"

MAX_INTERVIEW_QUESTIONS = 8

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment")

if not SUPABASE_SERVICE_ROLE_KEY:
    print("⚠️ Warning: SUPABASE_SERVICE_ROLE_KEY not set - organization creation may fail")