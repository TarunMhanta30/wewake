"""
UPI Request Decoder.

Standalone from the coercion engine: it does not score text, it parses a
UPI intent link and says plainly which way the money moves.

The dangerous case is "collect". A collect request is someone asking the
user for money, but it lands in the UPI app looking like an incoming
payment, so people approve it and enter their PIN to "receive" funds
that are in fact leaving.
"""

from __future__ import annotations

from urllib.parse import parse_qs, urlparse

# Pretexts that show up in the transaction note of scam links.
_SCAM_NOTE_WORDS = [
    "verify",
    "verification",
    "kyc",
    "refund",
    "safe",
    "secure",
    "escrow",
]

# At or above this the payee is worth a second look.
_LARGE_AMOUNT = 10000

_COLLECT_WARNING = (
    "Collect requests are a common scam. NPCI disabled person-to-person "
    "collect requests in Oct 2025. You never enter your UPI PIN to "
    "RECEIVE money."
)
_LARGE_AMOUNT_WARNING = "Large amount — double-check the payee before paying."


def _first(params: dict[str, list[str]], key: str) -> str | None:
    """First value for a query param, or None if absent."""
    values = params.get(key)
    if not values:
        return None
    return values[0]


def _scam_note_word(note: str | None) -> str | None:
    """The first scam pretext appearing in the transaction note."""
    if not note:
        return None
    lowered = note.lower()
    for word in _SCAM_NOTE_WORDS:
        if word in lowered:
            return word
    return None


def _amount_value(amount: str | None) -> float | None:
    """Amount as a number, or None when absent or not numeric."""
    if not amount:
        return None
    try:
        return float(amount)
    except ValueError:
        return None


def _payee_label(payee_name: str | None, payee_vpa: str | None) -> str:
    return payee_name or payee_vpa or "an unknown account"


def decode_upi(text: str) -> dict:
    """Parse a UPI intent link and explain which way the money moves."""
    parsed = urlparse((text or "").strip())

    if parsed.scheme.lower() != "upi":
        return {
            "is_upi": False,
            "action": None,
            "direction": "This is not a UPI payment link.",
            "payee_vpa": None,
            "payee_name": None,
            "amount": None,
            "warnings": [],
            "verdict": "SAFE_TO_REVIEW",
        }

    # keep_blank_values so that a present-but-empty "am=" survives parsing
    params = parse_qs(parsed.query, keep_blank_values=True)

    raw_action = parsed.netloc.lower()
    action = raw_action if raw_action in ("pay", "collect") else None

    payee_vpa = _first(params, "pa")
    payee_name = _first(params, "pn")
    amount = _first(params, "am")
    note = _first(params, "tn")

    payee = _payee_label(payee_name, payee_vpa)
    amount_number = _amount_value(amount)
    has_amount = amount_number is not None
    note_word = _scam_note_word(note)
    is_large = has_amount and amount_number >= _LARGE_AMOUNT

    warnings: list[str] = []

    if action == "collect":
        if has_amount:
            direction = (
                f"This is a COLLECT REQUEST. If you approve it, ₹{amount} "
                "will LEAVE your account — even though it may feel like "
                "receiving money."
            )
        else:
            direction = (
                "This is a COLLECT REQUEST. If you approve it, money will "
                "LEAVE your account — even though it may feel like "
                "receiving money."
            )
        warnings.append(_COLLECT_WARNING)
        verdict = "DANGER"

    elif action == "pay":
        if has_amount:
            direction = (
                f"You are PAYING ₹{amount} to {payee}. "
                "Money will LEAVE your account."
            )
        else:
            direction = (
                f"You are PAYING {payee}. Money will LEAVE your account."
            )
        verdict = "CAUTION" if (note_word or is_large) else "SAFE_TO_REVIEW"

    else:
        # A upi:// link whose action is neither pay nor collect.
        direction = (
            "This UPI link does not say whether money would leave or "
            "enter your account."
        )
        verdict = "SAFE_TO_REVIEW"

    if note_word:
        warnings.append(
            f"The note mentions '{note_word}', a common scam pretext."
        )
    if is_large:
        warnings.append(_LARGE_AMOUNT_WARNING)

    return {
        "is_upi": True,
        "action": action,
        "direction": direction,
        "payee_vpa": payee_vpa,
        "payee_name": payee_name,
        "amount": amount,
        "warnings": warnings,
        "verdict": verdict,
    }
