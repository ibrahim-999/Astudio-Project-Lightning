"""
Migration Service - AI-powered data import
"""
from anthropic import Anthropic
import pandas as pd
import json
import os
from typing import Dict, List, Any
from io import StringIO

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class MigrationService:
    """AI-powered data migration"""

    @staticmethod
    async def analyze_csv(csv_content: str) -> Dict[str, Any]:
        """
        Analyze CSV structure and suggest mapping
        """
        # Parse CSV
        df = pd.read_csv(StringIO(csv_content))

        # Get sample data
        sample = df.head(5).to_dict('records')
        columns = list(df.columns)

        # Ask AI to map fields
        prompt = f"""Analyze this CSV and map it to our expense schema.

CSV Columns: {columns}
Sample Data (first 5 rows):
{json.dumps(sample, indent=2)}

Our Expense Schema:
- description: string (what was purchased)
- amount: float (cost in USD)
- expense_date: date (YYYY-MM-DD format)
- vendor: string (who was paid)
- category: string (expense category)

Return ONLY valid JSON:
{{
  "mapping": {{
    "csv_column_name": "our_field_name"
  }},
  "transformations": [
    {{"field": "expense_date", "action": "convert_to_iso_date", "from_format": "MM/DD/YYYY"}}
  ],
  "confidence": 0.95,
  "total_rows": {len(df)},
  "warnings": ["any issues found"]
}}

If a CSV column doesn't match our schema, don't include it in mapping.
"""

        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )

        # Parse AI response
        ai_text = response.content[0].text

        # Extract JSON from response
        if "```json" in ai_text:
            ai_text = ai_text.split("```json")[1].split("```")[0].strip()
        elif "```" in ai_text:
            ai_text = ai_text.split("```")[1].split("```")[0].strip()

        try:
            mapping = json.loads(ai_text)
            return {
                "success": True,
                "mapping": mapping,
                "preview": sample[:3],  # Show first 3 rows
                "original_columns": columns
            }
        except json.JSONDecodeError:
            return {
                "success": False,
                "error": "AI response parsing failed",
                "raw_response": ai_text
            }

    @staticmethod
    def transform_data(df: pd.DataFrame, mapping: Dict) -> List[Dict]:
        """
        Transform CSV data to our format using AI mapping
        """
        transformed = []
        field_mapping = mapping.get('mapping', {})

        for _, row in df.iterrows():
            expense = {}

            # Map fields
            for csv_col, our_field in field_mapping.items():
                if csv_col in row:
                    expense[our_field] = row[csv_col]

            # Apply transformations if needed
            for transform in mapping.get('transformations', []):
                field = transform['field']
                action = transform['action']

                if action == 'convert_to_iso_date' and field in expense:
                    # Simple date conversion (you can make this smarter)
                    try:
                        date_val = pd.to_datetime(expense[field])
                        expense[field] = date_val.strftime('%Y-%m-%d')
                    except:
                        pass

            transformed.append(expense)

        return transformed

    @staticmethod
    async def import_expenses(csv_content: str, organization_id: str) -> Dict[str, Any]:
        """
        Complete import flow: analyze → transform → import
        """
        # Step 1: Analyze
        analysis = await MigrationService.analyze_csv(csv_content)

        if not analysis['success']:
            return analysis

        # Step 2: Transform
        df = pd.read_csv(StringIO(csv_content))
        transformed = MigrationService.transform_data(
            df,
            analysis['mapping']
        )

        # Step 3: Preview (don't actually import yet, just return preview)
        return {
            "success": True,
            "analysis": analysis['mapping'],
            "preview": transformed[:5],  # Show first 5 transformed
            "total_rows": len(transformed),
            "ready_to_import": True,
            "message": f"Ready to import {len(transformed)} expenses"
        }