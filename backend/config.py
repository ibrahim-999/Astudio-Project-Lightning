"""
Configuration and environment variables
"""
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

CORS_ORIGINS = [
    "http://localhost:3000",
    "https://*.vercel.app",
]

API_VERSION = "1.0.0"
API_TITLE = "Project Lightning AI Service"
API_DESCRIPTION = "AI orchestration for AI-native ERP"

MAX_INTERVIEW_QUESTIONS = 8

if __name__ == "__main__":
    print(f"ANTHROPIC_API_KEY: {ANTHROPIC_API_KEY[:20]}..." if ANTHROPIC_API_KEY else "MISSING")
    print(f"OPENAI_API_KEY: {OPENAI_API_KEY[:20]}..." if OPENAI_API_KEY else "MISSING")