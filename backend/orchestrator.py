"""
Unified AI Orchestrator - The Brain of Project Lightning
Routes natural language commands to appropriate modules
"""
from anthropic import Anthropic
import json
import os
from typing import Dict, Any
from database import db
from project_service import ProjectCoordinator, FinanceAssistant
from interview_service import InterviewConductor

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class UnifiedOrchestrator:
    """
    AI Brain that understands user intent and routes to correct module
    """

    @staticmethod
    async def process_command(
        user_message: str,
        organization_id: str,
        conversation_history: list = None
    ) -> Dict[str, Any]:
        """
        Main entry point: Takes natural language, returns action + response
        """

        print(f"\n🧠 ORCHESTRATOR: Processing command...")
        print(f"📝 User said: {user_message}")

        # Step 1: Classify user intent
        intent = await UnifiedOrchestrator._classify_intent(
            user_message,
            conversation_history or []
        )

        print(f"🎯 Detected: {intent['module']} - {intent['action']}")

        # Step 2: Route to appropriate module
        if intent['module'] == 'finance':
            result = await UnifiedOrchestrator._handle_finance(
                user_message, intent, organization_id
            )
        elif intent['module'] == 'project':
            result = await UnifiedOrchestrator._handle_project(
                user_message, intent, organization_id
            )
        elif intent['module'] == 'hr':
            result = await UnifiedOrchestrator._handle_hr(
                user_message, intent, organization_id
            )
        elif intent['module'] == 'general':
            result = await UnifiedOrchestrator._handle_general(
                user_message, intent, organization_id
            )
        else:
            result = {
                'success': False,
                'message': "I'm not sure what you want me to do. Can you rephrase?"
            }

        # Step 3: Add intent info to result
        result['intent'] = intent

        print(f"✅ Response generated\n")
        return result

    @staticmethod
    async def _classify_intent(message: str, history: list) -> Dict[str, Any]:
        """
        Use AI to understand what the user wants
        """

        prompt = f"""Analyze this user message and determine their intent.

User Message: "{message}"

Previous context: {json.dumps(history[-3:]) if history else "None"}

Classify into:

MODULES:
- "finance" - anything about expenses, costs, budgets, payments, receipts
- "project" - anything about projects, tasks, clients, deliverables, deadlines
- "hr" - anything about hiring, interviews, candidates, employees, team
- "general" - questions, help, status checks, greetings

ACTIONS:
- "create" - add/create something new
- "read" - view/show/list/get information
- "update" - modify/change something
- "delete" - remove something
- "chat" - conversation/question
- "analyze" - get insights/reports

Return ONLY valid JSON:
{{
  "module": "finance|project|hr|general",
  "action": "create|read|update|delete|chat|analyze",
  "entities": {{
    "description": "extracted description",
    "amount": 0.0,
    "project_name": "extracted name",
    "candidate_name": "extracted name"
  }},
  "confidence": 0.95,
  "natural_language": true
}}"""

        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.content[0].text.strip()

        # Extract JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        try:
            return json.loads(content)
        except:
            return {
                "module": "general",
                "action": "chat",
                "entities": {},
                "confidence": 0.5
            }

    @staticmethod
    async def _handle_finance(
        message: str,
        intent: Dict,
        organization_id: str
    ) -> Dict[str, Any]:
        """
        Handle finance-related commands
        """

        action = intent['action']
        entities = intent.get('entities', {})

        if action == 'create':
            # Extract expense details from natural language
            details = await UnifiedOrchestrator._extract_expense_details(message)

            # Create expense using AI categorization
            ai_result = await FinanceAssistant.categorize_expense(
                details['description'],
                details['amount'],
                details.get('vendor')
            )

            # Save to database
            expense_data = {
                "organization_id": organization_id,
                "description": details['description'],
                "amount": details['amount'],
                "expense_date": details.get('date', 'today'),
                "vendor": details.get('vendor'),
                "category": ai_result['category'],
                "ai_categorized": True,
                "status": "pending"
            }

            expense = db.create_expense(expense_data)

            # Build natural response
            response = f"✅ Got it! Added expense:\n\n"
            response += f"💰 ${details['amount']} - {details['description']}\n"
            response += f"📁 Category: {ai_result['category']}\n"

            if ai_result.get('ai_insights'):
                response += f"\n💡 AI Insight:\n{ai_result['ai_insights']}"

            return {
                'success': True,
                'message': response,
                'data': expense,
                'action_taken': 'created_expense'
            }

        elif action == 'read':
            # Get expenses
            expenses = db.get_expenses(organization_id)

            response = f"📊 You have {len(expenses)} expenses.\n\n"

            # Show last 5
            for exp in expenses[:5]:
                response += f"• ${exp['amount']} - {exp['description']}\n"

            if len(expenses) > 5:
                response += f"\n...and {len(expenses) - 5} more."

            return {
                'success': True,
                'message': response,
                'data': expenses
            }

        else:
            return {
                'success': True,
                'message': "What would you like to do with finances? You can:\n• Add an expense\n• View your expenses\n• Get a budget summary"
            }

    @staticmethod
    async def _extract_expense_details(message: str) -> Dict[str, Any]:
        """
        Extract expense details from natural language
        """

        prompt = f"""Extract expense details from this message:

"{message}"

Return ONLY valid JSON:
{{
  "description": "what was purchased",
  "amount": 0.0,
  "vendor": "who was paid (or null)",
  "date": "YYYY-MM-DD or 'today'"
}}

Examples:
"Lunch at Chipotle $47" → {{"description": "Lunch", "amount": 47.0, "vendor": "Chipotle", "date": "today"}}
"Adobe subscription 54.99" → {{"description": "Adobe subscription", "amount": 54.99, "vendor": "Adobe", "date": "today"}}
"""

        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.content[0].text.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        try:
            return json.loads(content)
        except:
            return {
                "description": message,
                "amount": 0.0,
                "vendor": None,
                "date": "today"
            }

    @staticmethod
    async def _handle_project(
        message: str,
        intent: Dict,
        organization_id: str
    ) -> Dict[str, Any]:
        """
        Handle project-related commands
        """

        action = intent['action']

        if action == 'create':
            # User wants to create a project
            # Use natural language as the brief
            ai_plan = await ProjectCoordinator.create_from_brief(
                message,
                None
            )

            # Create project
            from datetime import datetime, timedelta
            start_date = datetime.now().date()
            end_date = start_date + timedelta(days=ai_plan.get('estimated_duration_days', 30))

            project_data = {
                "organization_id": organization_id,
                "project_name": ai_plan['project_name'],
                "description": ai_plan['description'],
                "status": "planning",
                "priority": ai_plan.get('priority', 'medium'),
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "ai_generated": True
            }

            project = db.create_project(project_data)

            # Create tasks
            tasks = []
            for task_data in ai_plan.get('tasks', [])[:3]:  # Limit to 3 for quick response
                task = db.create_task({
                    "organization_id": organization_id,
                    "project_id": project['id'],
                    "task_title": task_data['title'],
                    "task_description": task_data.get('description'),
                    "priority": task_data.get('priority', 'medium'),
                    "status": "todo",
                    "ai_generated": True
                })
                tasks.append(task)

            response = f"✅ Project created!\n\n"
            response += f"📊 **{ai_plan['project_name']}**\n"
            response += f"{ai_plan['description']}\n\n"
            response += f"📝 Generated {len(tasks)} initial tasks\n"
            response += f"📅 Timeline: {ai_plan.get('estimated_duration_days', 30)} days"

            return {
                'success': True,
                'message': response,
                'data': {'project': project, 'tasks': tasks},
                'action_taken': 'created_project'
            }

        elif action == 'read':
            projects = db.get_projects(organization_id)

            response = f"📊 You have {len(projects)} projects:\n\n"

            for proj in projects[:5]:
                response += f"• **{proj['project_name']}** ({proj['status']})\n"

            return {
                'success': True,
                'message': response,
                'data': projects
            }

        else:
            return {
                'success': True,
                'message': "What would you like to do with projects? You can:\n• Create a new project\n• View your projects\n• Update project status"
            }

    @staticmethod
    async def _handle_hr(
        message: str,
        intent: Dict,
        organization_id: str
    ) -> Dict[str, Any]:
        """
        Handle HR-related commands
        """

        return {
            'success': True,
            'message': "🤖 HR Module ready!\n\nYou can:\n• Start an interview\n• View past interviews\n• See candidate analyses\n\nJust ask in natural language!"
        }

    @staticmethod
    async def _handle_general(
        message: str,
        intent: Dict,
        organization_id: str
    ) -> Dict[str, Any]:
        """
        Handle general queries and help
        """

        # Use AI to respond naturally
        prompt = f"""You are Project Lightning's AI assistant. Respond to this user message naturally and helpfully.

User: {message}

Available capabilities:
- Finance: Add expenses, view budgets, categorize costs
- Projects: Create projects, manage tasks, track deadlines
- HR: Conduct interviews, analyze candidates

Respond in a friendly, concise way (2-3 sentences max)."""

        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )

        return {
            'success': True,
            'message': response.content[0].text
        }