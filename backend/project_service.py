from openai import AsyncOpenAI
from anthropic import Anthropic
import json
import os

claude = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
    """
    3-Tier Multi-AI Strategy:
    1. GPT-3.5-turbo: Simple categorization (cheapest)
    2. Claude Haiku: Medium complexity (fast Claude)
    3. Claude Sonnet: Deep analysis (premium Claude)
    """

    @staticmethod
    async def categorize_expense(description: str, amount: float, vendor: str = None) -> dict:
        """
        Smart AI routing based on expense complexity and value
        """

        print(f"💰 Categorizing expense: ${amount} - {description}")

        # Tier 1: Simple categorization (GPT-3.5-turbo)
        # Use for ALL expenses - cheapest, fastest
        try:
            category_result = await FinanceAssistant._tier1_gpt_categorize(
                description, amount, vendor
            )
        except Exception as e:
            print(f"⚠️ GPT-3.5 failed, falling back to Claude Haiku")
            category_result = await FinanceAssistant._tier2_haiku_categorize(
                description, amount, vendor
            )

        # Tier 2: Medium complexity (Claude Haiku)
        # Use if GPT-3.5 has low confidence OR amount $100-$500
        if category_result.get('confidence', 0) < 0.8 or (100 <= amount <= 500):
            print(f"🔄 Low confidence or medium value - upgrading to Claude Haiku")
            category_result = await FinanceAssistant._tier2_haiku_categorize(
                description, amount, vendor
            )

        # Tier 3: Deep analysis (Claude Sonnet)
        # Use ONLY for high-value expenses (>$500)
        if amount > 500:
            print(f"💡 High value detected - using Claude Sonnet for deep analysis")
            analysis = await FinanceAssistant._tier3_sonnet_analysis(
                description, amount, vendor, category_result['category']
            )
            category_result['ai_insights'] = analysis
            category_result['analysis_model'] = 'claude-sonnet-4-5'
        else:
            category_result['ai_insights'] = None
            category_result['analysis_model'] = 'none'

        return category_result

    @staticmethod
    async def _tier1_gpt_categorize(description: str, amount: float, vendor: str = None) -> dict:
        """
        Tier 1: GPT-3.5-turbo (Cheapest & Fastest)
        Cost: ~$0.0005 per categorization
        """

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

        # Extract JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        result = json.loads(content)
        result['categorization_model'] = 'gpt-3.5-turbo'
        result['tier'] = 1

        print(f"✅ [Tier 1 - GPT-3.5] {result['category']} ({result.get('confidence', 0):.0%})")
        return result

    @staticmethod
    async def _tier2_haiku_categorize(description: str, amount: float, vendor: str = None) -> dict:
        """
        Tier 2: Claude Haiku 3.5 (Fast & Accurate)
        Cost: ~$0.001 per categorization
        Use: Medium complexity or low confidence from Tier 1
        """

        prompt = f"""Categorize this expense with careful reasoning:

Expense: {description}
Amount: ${amount}
{f'Vendor: {vendor}' if vendor else ''}

Categories: Software & Tools, Marketing, Office Supplies, Travel, Client Meetings, Freelancers, Other

Return JSON only:
{{"category": "exact category", "confidence": 0.0-1.0, "reasoning": "why this category"}}"""

        response = claude.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=150,
            temperature=0,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.content[0].text.strip()

        # Extract JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        result = json.loads(content)
        result['categorization_model'] = 'claude-haiku-3.5'
        result['tier'] = 2

        print(f"✅ [Tier 2 - Haiku] {result['category']} ({result.get('confidence', 0):.0%})")
        return result

    @staticmethod
    async def _tier3_sonnet_analysis(description: str, amount: float, vendor: str, category: str) -> str:
        """
        Tier 3: Claude Sonnet 4.5 (Deep Strategic Analysis)
        Cost: ~$0.003 per analysis
        Use: ONLY for high-value expenses (>$500)
        """

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

        insights = response.content[0].text
        print(f"✅ [Tier 3 - Sonnet] Deep analysis complete")
        return insights
