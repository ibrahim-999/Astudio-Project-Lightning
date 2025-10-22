"""
Finance API endpoints
"""
from fastapi import APIRouter, HTTPException

from models import ExpenseCreateRequest, ExpenseResponse
from database import db
from project_service import FinanceAssistant

router = APIRouter(prefix="/api", tags=["finance"])


@router.post("/expense/create", response_model=ExpenseResponse)
async def create_expense(request: ExpenseCreateRequest):
    """Create expense with AI categorization"""
    try:
        print(f"=== CREATE EXPENSE ===")
        print(f"Description: {request.description}")
        print(f"Amount: ${request.amount}")

        # Use AI to categorize
        ai_result = await FinanceAssistant.categorize_expense(
            request.description,
            request.amount,
            request.vendor
        )

        print(f"AI Category: {ai_result['category']} ({ai_result['confidence']})")

        # Create expense
        expense_data = {
            "organization_id": request.organization_id,
            "description": request.description,
            "amount": request.amount,
            "expense_date": request.expense_date,
            "vendor": request.vendor,
            "project_id": request.project_id,
            "category": ai_result['category'],
            "ai_categorized": True,
            "ai_category_confidence": ai_result['confidence'],
            "status": "pending"
        }

        expense = db.create_expense(expense_data)

        return ExpenseResponse(
            success=True,
            expense=expense,
            ai_category=ai_result['category'],
            confidence=ai_result['confidence']
        )

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/expenses")
async def get_expenses(organization_id: str):
    """Get all expenses"""
    try:
        expenses = db.get_expenses(organization_id)
        return {"success": True, "expenses": expenses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/expenses/summary")
async def get_expense_summary(organization_id: str):
    """Get expense summary by category"""
    try:
        summary = db.get_expense_summary(organization_id)
        return {"success": True, "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))