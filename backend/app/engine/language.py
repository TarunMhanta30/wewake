"""
WEWAKE — language detector (Feature 14).

Lightweight, dependency-free. Detects whether the message is in
Devanagari (Hindi/Marathi) or Latin script, and whether Latin text is
actually Romanized Hindi/Marathi ("kisi ko mat batana") rather than English.

Why not a library: language ID packages are heavy and unreliable on short,
code-mixed Indian messages ("bhai OTP bhejo urgent"). A script check plus a
Romanized-marker list is more accurate for exactly this use case, and has
zero install cost.
"""
from __future__ import annotations
import re

# Devanagari unicode block
_DEVANAGARI = re.compile(r"[\u0900-\u097F]")

# Words that appear in Romanized Hindi/Marathi but not in English.
_ROMANIZED_MARKERS = {
    # hindi
    "aap", "aapko", "aapka", "aapke", "kisi", "mat", "batana", "batao",
    "karo", "kar", "raha", "rahi", "hai", "hain", "nahi", "nahin",
    "paise", "paisa", "rupaye", "jaldi", "turant", "abhi", "bhejo",
    "bhej", "kya", "kyun", "mera", "meri", "tera", "aur", "phir",
    "gharwalon", "parivar", "bhai", "behen", "sahab", "ji", "kripya",
    "jama", "khata", "giraftar", "jurmana", "der", "mauka", "samay",
    "bataye", "dijiye", "kijiye", "hoga", "hogi", "gaya", "gayi",
    # marathi
    "tumhi", "tumhala", "kona", "konala", "sangu", "naka", "pathva",
    "lagech", "ahe", "aahe", "kara", "zala", "mala", "tyala", "ghya",
    "tabadtob", "atak",
}


def detect_language(text: str) -> dict:
    """
    Returns:
      {
        "script": "devanagari" | "latin" | "mixed" | "unknown",
        "language": "hi" | "mr" | "en" | "hi-latn" | "unknown",
        "label": human readable name,
        "confidence": "high" | "medium" | "low"
      }
    Note: Hindi and Marathi share the Devanagari script and much vocabulary,
    so we report "hi/mr" honestly rather than guessing between them.
    """
    if not text or not text.strip():
        return {"script": "unknown", "language": "unknown",
                "label": "Unknown", "confidence": "low"}

    deva_chars = len(_DEVANAGARI.findall(text))
    latin_chars = len(re.findall(r"[A-Za-z]", text))
    total = deva_chars + latin_chars

    if total == 0:
        return {"script": "unknown", "language": "unknown",
                "label": "Unknown", "confidence": "low"}

    deva_ratio = deva_chars / total

    # Mostly Devanagari
    if deva_ratio >= 0.6:
        return {"script": "devanagari", "language": "hi/mr",
                "label": "Hindi / Marathi (Devanagari)", "confidence": "high"}

    # Mixed script (code-switching, very common in India)
    if deva_ratio >= 0.15:
        return {"script": "mixed", "language": "hi/mr",
                "label": "Mixed Hindi/Marathi + English", "confidence": "medium"}

    # Latin script: is it Romanized Hindi/Marathi or English?
    words = set(re.findall(r"[a-z]+", text.lower()))
    hits = words & _ROMANIZED_MARKERS
    if len(hits) >= 2:
        return {"script": "latin", "language": "hi-latn",
                "label": "Romanized Hindi / Marathi", "confidence": "high"}
    if len(hits) == 1:
        return {"script": "latin", "language": "hi-latn",
                "label": "Possibly Romanized Hindi / Marathi",
                "confidence": "medium"}

    return {"script": "latin", "language": "en",
            "label": "English", "confidence": "high"}


if __name__ == "__main__":
    samples = [
        "आप डिजिटल अरेस्ट में हैं, किसी को मत बताना",
        "तुम्हाला अटक होईल, कोणालाही सांगू नका",
        "aapko giraftar kiya jayega, kisi ko mat batana, turant paise bhejo",
        "you are under digital arrest, do not tell your family",
        "bhai urgent OTP bhejo please",
        "hey can you send me the notes from class tomorrow",
    ]
    for s in samples:
        d = detect_language(s)
        print(f"{d['label']:38s} ({d['confidence']:6s})  {s[:45]}")
