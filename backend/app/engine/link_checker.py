"""
Link & App Checker.

Rule-based only. There is no network call, no reputation API, no live
threat feed — this inspects the shape of a domain and nothing more.

HONESTY NOTE: a "LOOKS_OK" verdict means *no rule fired*. It does NOT
mean the link was verified, checked against any blocklist, or is safe.
A brand-new phishing domain with a tidy name scores zero here.
"""

from __future__ import annotations

import re
from urllib.parse import urlparse

BANK_BRANDS = [
    "sbi", "hdfc", "icici", "axis", "kotak", "paytm", "phonepe", "gpay",
    "googlepay", "bhim", "rbi", "npci", "onecard", "yesbank", "pnb",
    "bankofbaroda", "canara", "idfc", "amazon", "flipkart",
]

SUSPICIOUS_TLDS = [
    ".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".online",
    ".click", ".site", ".live", ".buzz", ".rest", ".ru", ".cn",
]

SHORTENERS = [
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "rebrand.ly", "cutt.ly",
    "is.gd", "shorturl.at", "rb.gy", "ow.ly",
]

_URL_RE = re.compile(r"(https?://[^\s]+)")

# Bare domain fallback: a dotted token ending in a TLD we recognise.
_BARE_TLDS = SUSPICIOUS_TLDS + [
    ".com", ".in", ".net", ".org", ".co", ".io", ".me", ".info", ".biz",
]
_BARE_RE = re.compile(r"\b((?:[a-z0-9-]+\.)+[a-z]{2,})\b", re.IGNORECASE)

# Punctuation that tends to trail a URL pasted mid-sentence.
_TRAILING = ".,;:!?)]}>\"'"

_ADVICE = {
    "DANGER": "Do not open this link or enter any details.",
    "SUSPICIOUS": "Be careful. Verify the sender before opening.",
    "LOOKS_OK": (
        "No obvious red flags, but stay alert — this is not a guarantee "
        "of safety."
    ),
    "NO_LINK": "No web link was found in the text.",
}


def _no_link() -> dict:
    return {
        "found_link": False,
        "url": None,
        "host": None,
        "score": 0,
        "verdict": "NO_LINK",
        "reasons": [],
        "advice": _ADVICE["NO_LINK"],
    }


def _extract_url(text: str) -> str | None:
    """First http(s) URL, else a bare domain with a recognised TLD."""
    match = _URL_RE.search(text)
    if match:
        return match.group(1).rstrip(_TRAILING)

    for candidate in _BARE_RE.finditer(text):
        token = candidate.group(1).rstrip(_TRAILING).lower()
        if any(token.endswith(tld) for tld in _BARE_TLDS):
            return candidate.group(1).rstrip(_TRAILING)
    return None


def _host_of(url: str) -> str:
    """Hostname, lowercased, without www., userinfo or port."""
    parsed = urlparse(url if "//" in url else f"//{url}")
    host = parsed.netloc.lower()
    # https://sbi.com@evil.ru — the real host is what follows the @
    if "@" in host:
        host = host.rsplit("@", 1)[1]
    if ":" in host:
        host = host.split(":", 1)[0]
    if host.startswith("www."):
        host = host[4:]
    return host


def check_link(text: str) -> dict:
    url = _extract_url(text or "")
    if not url:
        return _no_link()

    host = _host_of(url)
    if not host:
        return _no_link()

    score = 0
    reasons: list[str] = []

    # (a) shortener — the destination is hidden until you click
    if host in SHORTENERS:
        score += 30
        reasons.append("Shortened link hides the real destination.")

    # (b) brand name present, but not that brand's plausible domain
    brand = next(
        (
            b
            for b in BANK_BRANDS
            if b in host
            and not (host.endswith(f"{b}.com") or host.endswith(f"{b}.in"))
        ),
        None,
    )
    if brand:
        score += 35
        reasons.append(
            f"Uses the name '{brand}' but is not an official {brand} domain."
        )

    # (c) uncommon TLD
    tld = next((t for t in SUSPICIOUS_TLDS if host.endswith(t)), None)
    if tld:
        score += 25
        reasons.append(
            f"Uses an uncommon domain ending ('{tld}') often used by scams."
        )

    # (d) irregular structure
    if host.count("-") >= 2 or host.count(".") >= 4:
        score += 15
        reasons.append("Domain structure looks irregular.")

    # (e) digits mixed into a brand name
    if brand and any(ch.isdigit() for ch in host):
        score += 10
        reasons.append("Mixes numbers into a brand name.")

    # (f) plain http
    if url.lower().startswith("http://"):
        score += 10
        reasons.append("Not a secure (https) link.")

    if score >= 45:
        verdict = "DANGER"
    elif score >= 20:
        verdict = "SUSPICIOUS"
    else:
        verdict = "LOOKS_OK"

    return {
        "found_link": True,
        "url": url,
        "host": host,
        "score": score,
        "verdict": verdict,
        "reasons": reasons,
        "advice": _ADVICE[verdict],
    }
