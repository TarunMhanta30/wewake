"""
WEWAKE — audio scam-call analyzer (Feature 15).

Pipeline: uploaded audio file -> transcribe (faster-whisper) -> the
transcript is then fed to the SAME coercion engine used everywhere else,
so an audio scam call gets the identical rules + ML + multilingual scoring
as pasted text.

Honesty / scope (matches the PPT):
- This analyses an UPLOADED / RECORDED clip. It is NOT live call
  interception — Android blocks reading the live call stream, and we do
  not claim otherwise.
- faster-whisper + the model are heavy. On this machine it runs. On a
  small/free host it may be unavailable. This module therefore DEGRADES
  GRACEFULLY: if the engine or model can't load, /api/analyze-audio returns
  a clear "audio transcription unavailable here" message instead of
  crashing the server. The rest of WEWAKE keeps working.

Model choice: "base" by default (good accuracy, ~150MB, multilingual so it
handles Hindi/Marathi too). Override with WEWAKE_WHISPER_MODEL=tiny for a
lighter/faster option.
"""
from __future__ import annotations
import os
import tempfile
from pathlib import Path

_MODEL_NAME = os.environ.get("WEWAKE_WHISPER_MODEL", "base")

_model = None
_load_error = None


def transcription_available() -> bool:
    """True if faster-whisper is importable (model loads lazily on first use)."""
    try:
        import faster_whisper  # noqa: F401
        return True
    except Exception:
        return False


def _get_model():
    """Lazy-load the Whisper model once. First call downloads it (silently)."""
    global _model, _load_error
    if _model is None and _load_error is None:
        try:
            from faster_whisper import WhisperModel
            # int8 keeps CPU memory low; cpu device for portability
            _model = WhisperModel(_MODEL_NAME, device="cpu", compute_type="int8")
        except Exception as e:
            _load_error = str(e)
    return _model


def transcribe_audio(file_bytes: bytes, filename: str = "audio") -> dict:
    """
    Transcribe an uploaded audio file.
    Returns:
      { "ok": bool,
        "transcript": str,        # empty if failed
        "language": str|null,     # whisper's detected language code
        "duration": float|null,   # seconds
        "error": str|null }
    Never raises — always returns a dict so the endpoint can respond cleanly.
    """
    if not transcription_available():
        return {"ok": False, "transcript": "", "language": None,
                "duration": None,
                "error": "Audio transcription is not available in this "
                         "environment (faster-whisper not installed)."}

    model = _get_model()
    if model is None:
        return {"ok": False, "transcript": "", "language": None,
                "duration": None,
                "error": f"Could not load the transcription model: {_load_error}"}

    # write bytes to a temp file (whisper reads from a path)
    suffix = Path(filename).suffix or ".wav"
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        segments, info = model.transcribe(tmp_path, beam_size=1)
        text = " ".join(seg.text.strip() for seg in segments).strip()

        return {"ok": True,
                "transcript": text,
                "language": getattr(info, "language", None),
                "duration": round(getattr(info, "duration", 0.0), 1),
                "error": None}
    except Exception as e:
        return {"ok": False, "transcript": "", "language": None,
                "duration": None, "error": f"Transcription failed: {e}"}
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass
