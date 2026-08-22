"""
First-Time Payee Card.

HONESTY NOTE: this is a *community-reported* registry, seeded with sample
data for demonstration. It is not a bank feed, not an NPCI feed, and not
an authoritative fraud list. An ID being absent means only that nobody
has reported it here — it is not a clean bill of health, and an ID being
present reflects unverified user reports.
"""

from __future__ import annotations

from datetime import timedelta

from sqlmodel import Session, select

from app.models.payee import PayeeReport, utcnow

# Sample seed data: (vpa, reports, days ago first seen)
SEED_PAYEES: list[tuple[str, int, int]] = [
    ("scammer@ybl", 12, 2),
    ("fraud@okhdfcbank", 5, 1),
    ("quickcash@paytm", 3, 5),
    ("refund-support@ybl", 8, 3),
]

# Below this age a payee with no reports is still "NEW" rather than "LOW".
_NEW_WINDOW_DAYS = 30

_UNKNOWN_MESSAGE = (
    "This UPI ID is not in our records. That does not mean it is safe — "
    "treat first-time payees with caution."
)


def _normalise(vpa: str) -> str:
    return (vpa or "").strip().lower()


def _times(count: int) -> str:
    return "once" if count == 1 else f"{count} times"


def seed_payees(session: Session) -> int:
    """Insert the sample rows, but only when the table is empty."""
    existing = session.exec(select(PayeeReport)).first()
    if existing is not None:
        return 0

    now = utcnow()
    for vpa, reports, days_ago in SEED_PAYEES:
        session.add(
            PayeeReport(
                vpa=vpa,
                reports=reports,
                first_seen=now - timedelta(days=days_ago),
            )
        )
    session.commit()
    return len(SEED_PAYEES)


def _find(vpa: str, session: Session) -> PayeeReport | None:
    return session.exec(select(PayeeReport).where(PayeeReport.vpa == vpa)).first()


def _risk_and_message(reports: int, age_days: int) -> tuple[str, str]:
    if reports >= 5:
        return "HIGH", (
            f"⚠ This ID has been reported {reports} times as fraudulent. "
            "Do not pay."
        )
    if reports >= 1:
        return "MEDIUM", (
            f"This ID has been reported {_times(reports)} as fraudulent. "
            "Verify who you are paying before sending any money."
        )
    if age_days < _NEW_WINDOW_DAYS:
        return "NEW", (
            f"This ID is only {age_days} days old and has no reports yet. "
            "New payees deserve extra caution."
        )
    return "LOW", (
        "This ID has no fraud reports on record. Stay alert anyway — no "
        "report is not the same as verified safe."
    )


def assess_payee(vpa: str, session: Session) -> dict:
    """Look up a UPI ID and describe its reported history."""
    normalised = _normalise(vpa)
    record = _find(normalised, session) if normalised else None

    if record is None:
        return {
            "known": False,
            "vpa": normalised,
            "reports": 0,
            "risk": "UNKNOWN",
            "message": _UNKNOWN_MESSAGE,
        }

    age_days = max((utcnow() - record.first_seen).days, 0)
    risk, message = _risk_and_message(record.reports, age_days)

    return {
        "known": True,
        "vpa": record.vpa,
        "reports": record.reports,
        "age_days": age_days,
        "risk": risk,
        "message": message,
    }


def report_payee(vpa: str, session: Session) -> dict:
    """Record one fraud report against a UPI ID, creating it if new."""
    normalised = _normalise(vpa)
    record = _find(normalised, session) if normalised else None

    if record is None:
        record = PayeeReport(vpa=normalised, reports=1, first_seen=utcnow())
        session.add(record)
    else:
        record.reports += 1
        session.add(record)

    session.commit()
    session.refresh(record)
    return assess_payee(normalised, session)
