"""
Project Management API endpoints
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta

from models import ProjectCreateRequest, ProjectResponse, TaskUpdateRequest
from database import db
from project_service import ProjectCoordinator

router = APIRouter(prefix="/api", tags=["projects"])


@router.post("/project/create", response_model=ProjectResponse)
async def create_project(request: ProjectCreateRequest):
    """Create project from natural language brief"""
    try:
        print(f"=== CREATE PROJECT FROM BRIEF ===")
        print(f"Brief: {request.brief[:100]}...")

        # Use AI to parse brief
        ai_plan = await ProjectCoordinator.create_from_brief(
            request.brief,
            request.client_name
        )

        print(f"AI Plan: {ai_plan['project_name']}")

        # Calculate dates
        start_date = datetime.now().date()
        end_date = start_date + timedelta(days=ai_plan.get('estimated_duration_days', 30))

        # Create project
        project_data = {
            "organization_id": request.organization_id,
            "project_name": ai_plan['project_name'],
            "description": ai_plan['description'],
            "client_name": ai_plan.get('client_name') or request.client_name,
            "status": "planning",
            "priority": ai_plan.get('priority', 'medium'),
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "ai_generated": True
        }

        project = db.create_project(project_data)
        print(f"Project created: {project['id']}")

        # Create tasks
        tasks = []
        for task_data in ai_plan.get('tasks', []):
            task = db.create_task({
                "organization_id": request.organization_id,
                "project_id": project['id'],
                "task_title": task_data['title'],
                "task_description": task_data.get('description'),
                "priority": task_data.get('priority', 'medium'),
                "estimated_hours": task_data.get('estimated_hours'),
                "status": "todo",
                "ai_generated": True
            })
            tasks.append(task)

        print(f"Created {len(tasks)} tasks")

        return ProjectResponse(
            success=True,
            project=project,
            tasks=tasks
        )

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects")
async def get_projects(organization_id: str):
    """Get all projects"""
    try:
        projects = db.get_projects(organization_id)
        return {"success": True, "projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/project/{project_id}/tasks")
async def get_project_tasks(project_id: str):
    """Get tasks for a project"""
    try:
        tasks = db.get_project_tasks(project_id)
        return {"success": True, "tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/task/update")
async def update_task(request: TaskUpdateRequest):
    """Update task status or assignment"""
    try:
        update_data = {}
        if request.status:
            update_data['status'] = request.status
        if request.assigned_to:
            update_data['assigned_to'] = request.assigned_to

        db.update_task(request.task_id, update_data)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))