"""
Project Service - AI Project Coordinator and Finance Assistant
"""
from anthropic import Anthropic
import os
import json

claude = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

try:
    from openai import AsyncOpenAI
    openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    OPENAI_AVAILABLE = True
except Exception:
    OPENAI_AVAILABLE = False
    openai_client = None


class ProjectCoordinator:
    """AI Project Coordinator"""

    @staticmethod
    async def create_from_brief(brief: str, client_name: str = None) -> dict:
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

        response = claude.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.content[0].text

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        try:
            return json.loads(content)
        except:
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
    """3-Tier AI categorization with automatic fallback"""

    @staticmethod
    async def categorize_expense(description: str, amount: float, vendor: str = None) -> dict:
        category_result = None

        if OPENAI_AVAILABLE:
            try:
                category_result = await FinanceAssistant._tier1_gpt_categorize(
                    description, amount, vendor
                )
            except Exception:
                category_result = None

        if not category_result or not isinstance(category_result, dict):
            try:
                category_result = await FinanceAssistant._tier2_haiku_categorize(
                    description, amount, vendor
                )
            except Exception:
                category_result = None

        if not category_result or not isinstance(category_result, dict):
            category_result = {
                'category': 'Other',
                'confidence': 0.5,
                'reasoning': 'AI categorization unavailable',
                'categorization_model': 'fallback',
                'tier': 0
            }

        if 'category' not in category_result or not category_result['category']:
            category_result['category'] = 'Other'

        if OPENAI_AVAILABLE and (category_result.get('confidence', 0) < 0.8 or (100 <= amount <= 500)):
            try:
                haiku_result = await FinanceAssistant._tier2_haiku_categorize(
                    description, amount, vendor
                )
                if haiku_result and haiku_result.get('category'):
                    category_result = haiku_result
            except Exception:
                pass

        if amount > 500:
            try:
                analysis = await FinanceAssistant._tier3_sonnet_analysis(
                    description, amount, vendor, category_result['category']
                )
                category_result['ai_insights'] = analysis
                category_result['analysis_model'] = 'claude-sonnet-4-5'
            except Exception:
                category_result['ai_insights'] = None
                category_result['analysis_model'] = 'none'
        else:
            category_result['ai_insights'] = None
            category_result['analysis_model'] = 'none'

        if not category_result.get('category'):
            category_result['category'] = 'Other'
        if not category_result.get('confidence'):
            category_result['confidence'] = 0.5

        return category_result

    @staticmethod
    async def _tier1_gpt_categorize(description: str, amount: float, vendor: str = None) -> dict:
        if not OPENAI_AVAILABLE or not openai_client:
            raise Exception("OpenAI not available")

        prompt = f"""Categorize this expense into ONE category:

Categories:
- Software & Tools
- Marketing
- Office Supplies
- Travel
- Client Meetings
- Freelancers
- Other

Expense: {description}
Amount: ${amount}
{f'Vendor: {vendor}' if vendor else ''}

Respond with ONLY valid JSON:
{{"category": "category name", "confidence": 0.95, "reasoning": "brief reason"}}"""

        response = await openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.1
        )

        content = response.choices[0].message.content.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        result = json.loads(content)
        result['categorization_model'] = 'gpt-3.5-turbo'
        result['tier'] = 1

        return result

    @staticmethod
    async def _tier2_haiku_categorize(description: str, amount: float, vendor: str = None) -> dict:
        prompt = f"""Categorize this expense with careful reasoning:

Expense: {description}
Amount: ${amount}
{f'Vendor: {vendor}' if vendor else ''}

Categories: Software & Tools, Marketing, Office Supplies, Travel, Client Meetings, Freelancers, Other

Return ONLY valid JSON:
{{"category": "exact category", "confidence": 0.0-1.0, "reasoning": "why this category"}}"""

        response = claude.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=150,
            temperature=0,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.content[0].text.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        result = json.loads(content)
        result['categorization_model'] = 'claude-haiku-3.5'
        result['tier'] = 2

        return result

    @staticmethod
    async def _tier3_sonnet_analysis(description: str, amount: float, vendor: str, category: str) -> str:
        prompt = f"""Analyze this high-value expense with executive-level strategic thinking:

💰 Expense Details:
- Description: {description}
- Amount: ${amount:,.2f}
- Vendor: {vendor or 'Unknown'}
- Category: {category}

📊 Provide Strategic Analysis:
1. Expense Justification: Is this reasonable for the category and amount?
2. Budget Impact: How does this affect monthly/quarterly spending?
3. Approval Process: What approval chain do you recommend?
4. Cost Optimization: Any alternatives or negotiation opportunities?
5. Risk Assessment: Red flags or recommendations?

Keep response concise but insightful (4-5 sentences)."""

        response = claude.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=400,
            temperature=0.3,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.content[0].text