"""SQLModel table recording every coercion analysis and its reasons.

This is the transparency layer: nothing is scored without a row here
explaining why, and every row can be disputed by the user.
"""

from datetime import datetime

from sqlmodel import Field, SQLModel

from app.models.payee import utcnow


class AnalysisLog(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utcnow)
    text_excerpt: str = ""
    score: int = 0
    level: str = ""
    reasons_json: str = "[]"
    disputed: bool = Field(default=False)
