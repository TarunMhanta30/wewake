"""SQLModel table for community-reported UPI payees."""

from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    """Naive UTC timestamp, so stored and computed values stay comparable."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class PayeeReport(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    vpa: str = Field(index=True)
    reports: int = Field(default=0)
    first_seen: datetime = Field(default_factory=utcnow)
