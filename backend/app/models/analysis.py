"""Request/response schemas for the analyze endpoint."""

from enum import Enum

from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="Message or transcript to analyze.")


class AnalyzeResponse(BaseModel):
    score: int = 0
    level: RiskLevel = RiskLevel.LOW
    reasons: list[str] = Field(default_factory=list)
