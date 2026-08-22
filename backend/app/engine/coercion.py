"""
WEWAKE coercion detection engine.

Powers features 4 (Coercion Script Engine), 5 (Authority Truth Card),
and 6 (Secrecy Trigger).

Design in one breath:
- We do NOT try to detect "is this a scam" by keyword counting.
- We detect WHICH psychological elements a message contains
  (authority, accusation, threat, secrecy, isolation, ...),
  then match that element-fingerprint to the closest known script.
- Secrecy is weighted highest on purpose: no honest party ever asks
  you to hide a payment from your family. It is the single strongest
  signal, so it can push a message to DANGER on its own.

The output is fully explainable: every point added carries a reason.
That is what feeds the "Why-It-Flagged" log later.
"""

from __future__ import annotations
import json
import re
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

# ---- load corpus once at import ----
_CORPUS_PATH = Path(__file__).parent.parent / "data" / "scam_scripts.json"
_CORPUS = json.loads(_CORPUS_PATH.read_text(encoding="utf-8"))

_ELEMENTS = _CORPUS["elements"]
_KEYWORDS = _CORPUS["keywords"]
_SCRIPTS = _CORPUS["scripts"]

# Secrecy is the highest-signal element. If present, it alone can
# lift the risk band. This multiplier is applied to the final score.
_SECRECY_BOOST = 1.15

# Score thresholds -> bands
_BANDS = [
    (75, "DANGER"),
    (45, "HIGH"),
    (20, "CAUTION"),
    (0,  "LOW"),
]


@dataclass
class Reason:
    element: str
    label: str
    points: int
    matched: str  # the phrase that triggered it


@dataclass
class Analysis:
    score: int
    level: str
    reasons: list[Reason] = field(default_factory=list)
    matched_script_id: Optional[str] = None
    matched_script_name: Optional[str] = None
    match_confidence: int = 0
    tagline: Optional[str] = None
    truth: Optional[str] = None            # feeds the Authority Truth Card
    secrecy_triggered: bool = False        # feeds the Secrecy Trigger
    present_elements: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "score": self.score,
            "level": self.level,
            "reasons": [
                {"element": r.element, "label": r.label,
                 "points": r.points, "matched": r.matched}
                for r in self.reasons
            ],
            "matched_script": (
                None if not self.matched_script_id else {
                    "id": self.matched_script_id,
                    "name": self.matched_script_name,
                    "confidence": self.match_confidence,
                    "tagline": self.tagline,
                }
            ),
            "truth_card": self.truth,
            "secrecy_triggered": self.secrecy_triggered,
            "present_elements": self.present_elements,
        }


def _normalize(text: str) -> str:
    text = text.lower()
    text = text.replace("\u2019", "'").replace("\u2018", "'")
    text = re.sub(r"\s+", " ", text)
    return text


def _find_elements(text: str) -> dict[str, str]:
    """Return {element: first_matched_phrase} for every element present."""
    found: dict[str, str] = {}
    for element, phrases in _KEYWORDS.items():
        for phrase in phrases:
            if phrase in text:
                found[element] = phrase
                break
    return found


# ---- script matching / ranking tunables (ranking only, not scoring) ----

# Two scripts within this many confidence points are treated as "similar";
# absolute element overlap then decides between them. The window has to be
# this wide because the ratio maths structurally inflates scripts that
# declare only one required element (a lone hit gives them the full 60%),
# while a three-required script sits ~30 points lower on the same evidence.
_CONF_WINDOW = 30

# Missing-required penalty. Raised from 0.55 so that matching 2 of 3
# required elements plus strong signals is not demoted below an
# unrelated script that trivially satisfies its single required element.
_MISSING_REQUIRED_PENALTY = 0.75

# authority + threat + (secrecy or isolation) is the coercion signature.
# When it is present the match is biased toward these scripts.
_COERCION_SCRIPTS = ("digital_arrest", "courier_parcel")


def _has_coercion_signature(present: set[str]) -> bool:
    return (
        "authority_claim" in present
        and "threat" in present
        and bool(present & {"secrecy_demand", "isolation"})
    )


def _match_script(present: set[str]) -> tuple[Optional[dict], int]:
    """
    Match the present elements to the best-fitting known script.
    Confidence = weighted overlap of required/strong/supporting elements.

    Ranking is two-stage: confidence selects a band of plausible scripts,
    then absolute element overlap decides within that band, so a script
    that explains more of the message wins over one that merely scores a
    high ratio on a thin definition.
    """
    candidates: list[tuple[dict, int, int]] = []
    for script in _SCRIPTS:
        required = set(script["required"])
        strong = set(script.get("strong", []))
        supporting = set(script.get("supporting", []))

        # required elements are gating: miss one and confidence is cut
        req_hit = len(required & present)
        req_total = max(len(required), 1)
        req_ratio = req_hit / req_total

        strong_hit = len(strong & present)
        strong_total = max(len(strong), 1)

        support_hit = len(supporting & present)
        support_total = max(len(supporting), 1)

        # weighted: required 60%, strong 30%, supporting 10%
        conf = (
            0.60 * req_ratio
            + 0.30 * (strong_hit / strong_total)
            + 0.10 * (support_hit / support_total)
        )
        # penalise if a required element is missing entirely
        if req_ratio < 1.0:
            conf *= _MISSING_REQUIRED_PENALTY

        # how much of the message this script actually explains, in
        # absolute terms rather than as a ratio
        overlap = len((required | strong) & present)

        candidates.append((script, int(round(conf * 100)), overlap))

    top_conf = max((c[1] for c in candidates), default=0)
    if top_conf <= 0:
        return None, 0

    # scripts close enough to the leader to be worth comparing on overlap
    band = [c for c in candidates if c[1] >= top_conf - _CONF_WINDOW]

    # coercion signature present: prefer a coercion script from the band
    if _has_coercion_signature(present):
        coercive = [c for c in band if c[0]["id"] in _COERCION_SCRIPTS]
        if coercive:
            band = coercive

    # more matched elements wins; confidence breaks ties
    best = max(band, key=lambda c: (c[2], c[1]))
    return best[0], best[1]


def analyze(text: str) -> Analysis:
    if not text or not text.strip():
        return Analysis(score=0, level="LOW")

    norm = _normalize(text)
    found = _find_elements(norm)
    present = set(found.keys())

    # ---- base score from element weights, with reasons ----
    reasons: list[Reason] = []
    raw = 0
    for element, phrase in found.items():
        w = _ELEMENTS[element]["weight"]
        raw += w
        reasons.append(Reason(
            element=element,
            label=_ELEMENTS[element]["label"],
            points=w,
            matched=phrase,
        ))

    # ---- secrecy trigger (feature 6): highest-signal override ----
    secrecy_triggered = "secrecy_demand" in present
    if secrecy_triggered:
        raw = int(round(raw * _SECRECY_BOOST))

    # cap at 100
    score = min(raw, 100)

    # ---- band ----
    level = "LOW"
    for threshold, name in _BANDS:
        if score >= threshold:
            level = name
            break

    # ---- script match (feature 4) + truth card (feature 5) ----
    script, confidence = _match_script(present)
    matched_id = matched_name = tagline = truth = None
    if script and confidence >= 30:
        matched_id = script["id"]
        matched_name = script["name"]
        tagline = script["tagline"]
        truth = script["truth"]

    # sort reasons by points desc so the biggest signals surface first
    reasons.sort(key=lambda r: r.points, reverse=True)

    return Analysis(
        score=score,
        level=level,
        reasons=reasons,
        matched_script_id=matched_id,
        matched_script_name=matched_name,
        match_confidence=confidence if matched_id else 0,
        tagline=tagline,
        truth=truth,
        secrecy_triggered=secrecy_triggered,
        present_elements=sorted(present),
    )


# quick manual test: python coercion.py
if __name__ == "__main__":
    samples = [
        "Sir, a parcel in your name has 200g MDMA. Mumbai Cyber Crime has "
        "issued an arrest warrant. You are under digital arrest. Stay on this "
        "Skype video call, do not tell your family, and transfer your funds to "
        "our RBI verification account.",
        "Hey, are we still meeting for lunch tomorrow at 1pm?",
        "This is HDFC support, your transaction failed. Share your UPI PIN and "
        "OTP to process your refund of 4999 immediately.",
    ]
    for s in samples:
        a = analyze(s)
        print(f"\nSCORE {a.score} [{a.level}]  "
              f"match={a.matched_script_name} ({a.match_confidence}%)  "
              f"secrecy={a.secrecy_triggered}")
        for r in a.reasons:
            print(f"   +{r.points:2d}  {r.label}  <- '{r.matched}'")
