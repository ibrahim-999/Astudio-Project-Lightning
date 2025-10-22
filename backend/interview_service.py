from anthropic import Anthropic
from datetime import datetime
from typing import List, Dict, Any
import json
import os

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class InterviewConductor:

    def __init__(self, position: str, candidate_name: str):
        self.position = position
        self.candidate_name = candidate_name
        self.conversation_history = []
        self.question_count = 0
        self.max_questions = 8

    def get_system_prompt(self) -> str:
        return f"""You are a professional HR interviewer conducting a job interview for the position of {self.position}.

Your interviewing style:
- Professional but friendly and conversational
- Ask thoughtful follow-up questions based on responses
- Assess technical skills, communication, and cultural fit
- Keep questions relevant to the role
- Make the candidate feel comfortable
- Ask about experience, problem-solving, and motivations

Interview structure:
1. Start with a warm greeting
2. Ask about background and experience (2-3 questions)
3. Technical/role-specific questions (3-4 questions)
4. Behavioral and situational questions (2-3 questions)
5. Close by asking if they have questions

Guidelines:
- Keep your messages concise (2-3 sentences max)
- One question at a time
- Show genuine interest in their answers
- Be encouraging and positive
- Naturally transition between topics

Candidate name: {self.candidate_name}
Position: {self.position}

You are now conducting this interview. Start by greeting the candidate warmly and asking your first question."""

    async def start_interview(self) -> str:
        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=300,
            system=self.get_system_prompt(),
            messages=[
                {
                    "role": "user",
                    "content": f"Please start the interview with {self.candidate_name}."
                }
            ]
        )

        ai_message = response.content[0].text
        self.conversation_history.append({
            "role": "assistant",
            "content": ai_message
        })
        self.question_count += 1

        return ai_message

    async def process_response(self, candidate_response: str) -> Dict[str, Any]:
        self.conversation_history.append({
            "role": "user",
            "content": candidate_response
        })

        should_end = self.question_count >= self.max_questions

        if should_end:
            messages = self.conversation_history + [{
                "role": "user",
                "content": "Please conclude the interview professionally and thank the candidate."
            }]
        else:
            messages = self.conversation_history

        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=300,
            system=self.get_system_prompt(),
            messages=messages
        )

        ai_message = response.content[0].text

        self.conversation_history.append({
            "role": "assistant",
            "content": ai_message
        })

        self.question_count += 1

        return {
            "ai_message": ai_message,
            "question_number": self.question_count,
            "is_complete": should_end,
            "conversation_history": self.conversation_history
        }

    async def analyze_interview(self) -> Dict[str, Any]:

        transcript = "\n\n".join([
            f"{'Interviewer' if msg['role'] == 'assistant' else 'Candidate'}: {msg['content']}"
            for msg in self.conversation_history
        ])

        analysis_prompt = f"""Analyze this job interview transcript and provide a detailed assessment.

Position: {self.position}
Candidate: {self.candidate_name}

TRANSCRIPT:
{transcript}

Provide your analysis in the following JSON format:
{{
  "overall_score": <1-100>,
  "technical_score": <1-100>,
  "communication_score": <1-100>,
  "cultural_fit_score": <1-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "key_insights": "Brief summary of key observations",
  "recommendation": "strong_hire" | "hire" | "maybe" | "no_hire",
  "detailed_analysis": "Comprehensive analysis paragraph"
}}

Be honest, fair, and specific in your assessment."""

        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2000,
            messages=[{"role": "user", "content": analysis_prompt}]
        )

        analysis_text = response.content[0].text

        if "```json" in analysis_text:
            analysis_text = analysis_text.split("```json")[1].split("```")[0].strip()
        elif "```" in analysis_text:
            analysis_text = analysis_text.split("```")[1].split("```")[0].strip()

        try:
            analysis = json.loads(analysis_text)
            return analysis
        except json.JSONDecodeError:
            return {
                "overall_score": 70,
                "technical_score": 70,
                "communication_score": 75,
                "cultural_fit_score": 70,
                "strengths": ["Good communication", "Relevant experience"],
                "weaknesses": ["Could provide more specific examples"],
                "key_insights": "Candidate showed potential but needs more depth in responses.",
                "recommendation": "maybe",
                "detailed_analysis": analysis_text
            }