"""
Project Service - AI-powered project creation and task breakdown
"""
from anthropic import Anthropic
import json
import os

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class ProjectCoordinator:
    """AI Project Coordinator - Creates projects from natural language"""
    
    @staticmethod
    async def create_from_brief(brief: str, client_name: str = None) -> dict:
        """
        Create project structure from natural language brief
        AI extracts: name, description, tasks, timeline
        """
        
        prompt = f"""Analyze this project brief and create a structured project plan.

PROJECT BRIEF:
{brief}

{f'CLIENT: {client_name}' if client_name else ''}

Return a JSON object with:
{{
  "project_name": "Clear, concise project name",
  "description": "One paragraph project description",
  "client_name": "Client name if mentioned, else null",
  "estimated_duration_days": <number>,
  "priority": "low" | "medium" | "high" | "urgent",
  "tasks": [
    {{
      "title": "Task name",
      "description": "What needs to be done",
      "estimated_hours": <number>,
      "priority": "low" | "medium" | "high"
    }}
  ],
  "key_deliverables": ["deliverable1", "deliverable2"],
  "recommended_team_size": <number>
}}

Keep it practical and realistic. Generate 5-8 tasks."""

        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Parse response
        content = response.content[0].text
        
        # Extract JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        try:
            return json.loads(content)
        except:
            # Fallback
            return {
                "project_name": "New Project",
                "description": brief,
                "estimated_duration_days": 30,
                "priority": "medium",
                "tasks": [
                    {"title": "Planning & Research", "description": "Initial project planning", "estimated_hours": 8, "priority": "high"},
                    {"title": "Design Phase", "description": "Create designs and mockups", "estimated_hours": 16, "priority": "medium"},
                    {"title": "Development", "description": "Build the solution", "estimated_hours": 40, "priority": "high"},
                    {"title": "Testing", "description": "Quality assurance and testing", "estimated_hours": 16, "priority": "medium"},
                    {"title": "Deployment", "description": "Deploy to production", "estimated_hours": 8, "priority": "high"}
                ]
            }

class FinanceAssistant:
    """AI Finance Assistant - Categorizes expenses"""
    
    @staticmethod
    async def categorize_expense(description: str, amount: float, vendor: str = None) -> dict:
        """Categorize an expense using AI"""
        
        prompt = f"""Categorize this expense:

Description: {description}
Amount: ${amount}
{f'Vendor: {vendor}' if vendor else ''}

Available categories:
- Software & Tools
- Marketing
- Office Supplies
- Travel
- Client Meetings
- Freelancers
- Other

Return JSON:
{{
  "category": "category name",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}}"""

        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        
        content = response.content[0].text
        
        # Extract JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        try:
            return json.loads(content)
        except:
            return {
                "category": "Other",
                "confidence": 0.5,
                "reasoning": "Unable to determine category"
            }