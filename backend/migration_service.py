"""
Migration Service - AI-powered CSV analysis and import
"""
from anthropic import Anthropic
import os
import json
import csv
from io import StringIO
from datetime import datetime

claude = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class MigrationService:
    """AI-powered migration toolkit"""

    @staticmethod
    async def analyze_csv(csv_content: str) -> dict:
        try:
            csv_file = StringIO(csv_content)
            reader = csv.DictReader(csv_file)
            rows = list(reader)

            if not rows:
                return {"success": False, "error": "Empty CSV file"}

            columns = list(rows[0].keys())

            prompt = f"""Analyze this CSV structure and map fields for expense import.

CSV Columns: {', '.join(columns)}
Sample Row: {json.dumps(rows[0])}

Expected Target Fields:
- expense_date (date of expense)
- description (what was purchased)
- amount (cost in dollars)
- vendor (who sold it)

Return ONLY valid JSON:
{{
  "mapping": {{
    "CSV_Column_Name": "target_field_name"
  }},
  "confidence": 0.95,
  "warnings": ["any issues"]
}}"""

            response = claude.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )

            content = response.content[0].text

            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            mapping = json.loads(content)

            return {
                "success": True,
                "original_columns": columns,
                "mapping": mapping,
                "preview": rows[:3],
                "total_rows": len(rows)
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def parse_date(date_str: str) -> str:
        if not date_str:
            return datetime.now().strftime('%Y-%m-%d')

        formats = [
            '%Y-%m-%d',
            '%m/%d/%Y',
            '%d/%m/%Y',
            '%Y/%m/%d',
            '%m-%d-%Y',
            '%d-%m-%Y',
        ]

        for fmt in formats:
            try:
                return datetime.strptime(str(date_str), fmt).strftime('%Y-%m-%d')
            except:
                continue

        return datetime.now().strftime('%Y-%m-%d')

    @staticmethod
    async def import_expenses(csv_content: str, organization_id: str) -> dict:
        try:
            analysis = await MigrationService.analyze_csv(csv_content)

            if not analysis['success']:
                return analysis

            csv_file = StringIO(csv_content)
            reader = csv.DictReader(csv_file)
            rows = list(reader)

            mapping = analysis['mapping']['mapping']
            transformed_rows = []

            for row in rows:
                transformed = {}

                for csv_col, target_field in mapping.items():
                    if csv_col in row and row[csv_col]:
                        value = row[csv_col].strip()

                        if target_field == 'expense_date':
                            value = MigrationService.parse_date(value)
                        elif target_field == 'amount':
                            value = value.replace('$', '').replace(',', '').strip()
                            try:
                                value = float(value)
                            except:
                                value = 0

                        transformed[target_field] = value

                if 'description' not in transformed or not transformed['description']:
                    transformed['description'] = 'Unknown Expense'

                if 'amount' not in transformed:
                    transformed['amount'] = 0

                if 'expense_date' not in transformed:
                    transformed['expense_date'] = datetime.now().strftime('%Y-%m-%d')

                transformed_rows.append(transformed)

            return {
                "success": True,
                "transformed_data": transformed_rows,
                "preview": transformed_rows[:3],
                "original_columns": analysis['original_columns'],
                "total_rows": len(transformed_rows),
                "mapping": analysis['mapping'],
                "analysis": "Successfully mapped and transformed all rows"
            }

        except Exception as e:
            return {"success": False, "error": str(e)}