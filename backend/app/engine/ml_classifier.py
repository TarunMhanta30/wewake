"""
WEWAKE — ML coercion classifier (Feature 13).

Why this exists:
The rules engine (coercion.py) is precise but literal — it matches known
phrases. A scammer who rewords ("move your balance to the monitored
account" instead of "transfer to safe account") slips straight past it.

This module adds a trained TF-IDF + Logistic Regression classifier that
learns the *shape* of coercive language, so it generalises to phrasings
it has never seen. It runs ALONGSIDE the rules, never replacing them.

Combination policy (deliberate, and defensible in Q&A):
- The ML only speaks when it is reasonably confident (>= ML_THRESHOLD).
  Below that it contributes 0. This is what prevents false positives on
  ordinary messages, which typically score 0.30-0.40.
- The final score is max(rules, ml). The ML can only ESCALATE risk, never
  reduce it. A clear rules-based DANGER is never softened by the model.
"""
from __future__ import annotations
from pathlib import Path
from typing import Optional
import joblib

_MODEL_PATH = Path(__file__).parent.parent / "data" / "coercion_model.joblib"

# Below this probability the model stays silent. Tuned so that ordinary
# messages (which score ~0.30-0.40) never trigger a flag.
ML_THRESHOLD = 0.55

_model = None
_load_error: Optional[str] = None


def _get_model():
    """Lazy-load the model once. If it is missing, degrade gracefully."""
    global _model, _load_error
    if _model is None and _load_error is None:
        try:
            _model = joblib.load(_MODEL_PATH)
        except Exception as e:  # model not trained yet
            _load_error = str(e)
    return _model


def ml_score(text: str) -> dict:
    """
    Returns:
      {
        "available": bool,     # False if model file is missing
        "probability": float,  # 0.0-1.0 chance the text is coercive
        "percent": int,        # probability as 0-100
        "counted": bool,       # True if >= ML_THRESHOLD (i.e. it contributes)
        "score": int           # percent if counted else 0
      }
    """
    model = _get_model()
    if model is None or not text or not text.strip():
        return {"available": model is not None, "probability": 0.0,
                "percent": 0, "counted": False, "score": 0}

    prob = float(model.predict_proba([text])[0][1])
    counted = prob >= ML_THRESHOLD
    pct = int(round(prob * 100))
    return {
        "available": True,
        "probability": round(prob, 4),
        "percent": pct,
        "counted": counted,
        "score": pct if counted else 0,
    }


def combine(rules_score: int, ml: dict) -> dict:
    """
    Merge the rules score and the ML score.
    The ML can only escalate, never reduce.
    """
    final = max(rules_score, ml["score"])

    if final >= 75:
        level = "DANGER"
    elif final >= 45:
        level = "HIGH"
    elif final >= 20:
        level = "CAUTION"
    else:
        level = "LOW"

    if rules_score >= 20 and ml["counted"]:
        source = "BOTH"
        note = "Both the rule engine and the ML model flagged this."
    elif ml["score"] > rules_score:
        source = "ML_ONLY"
        note = ("The rule engine did not match a known phrase, but the ML "
                "model recognised the coercive pattern — this looks like a "
                "reworded scam.")
    elif rules_score > 0:
        source = "RULES_ONLY"
        note = "Matched known scam-script phrases."
    else:
        source = "NEITHER"
        note = "No coercion signals detected."

    return {"final_score": final, "level": level, "source": source, "note": note}
