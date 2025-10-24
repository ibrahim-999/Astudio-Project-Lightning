"""Migration API endpoints"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from migration_service import MigrationService
from project_service import FinanceAssistant
from database import db
from datetime import datetime

router = APIRouter(prefix="/api/migration", tags=["migration"])


@router.post("/analyze-csv")
async def analyze_csv(
    file: UploadFile = File(...),
    organization_id: str = Form(...)  #
):
    """Analyze CSV structure"""
    try:
        content = await file.read()
        csv_content = content.decode('utf-8')
        result = await MigrationService.analyze_csv(csv_content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/import-expenses")
async def import_expenses(
    file: UploadFile = File(...),
    organization_id: str = Form(...)  #
):
    try:
        content = await file.read()
        csv_content = content.decode('utf-8')

        result = await MigrationService.import_expenses(csv_content, organization_id)

        if not result['success']:
            return result

        all_expenses = result.get('transformed_data', result['preview'])
        imported_count = 0

        for expense_data in all_expenses:
            try:
                ai_result = await FinanceAssistant.categorize_expense(
                    description=expense_data.get('description', ''),
                    amount=float(expense_data.get('amount', 0)),
                    vendor=expense_data.get('vendor')
                )

                expense_data['category'] = ai_result.get('category', 'Other')
                expense_data['ai_categorized'] = True
                expense_data['ai_category_confidence'] = ai_result.get('confidence', 0)
                expense_data['organization_id'] = organization_id
                expense_data['status'] = 'pending'

                if 'expense_date' not in expense_data:
                    expense_data['expense_date'] = datetime.now().strftime('%Y-%m-%d')

                db.create_expense(expense_data)
                imported_count += 1

            except Exception as e:
                print(f"Error importing expense: {e}")
                continue

        return {
            "success": True,
            "imported": imported_count,
            "total": len(all_expenses)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))