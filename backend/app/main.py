"""wewake — coercion-aware financial fraud firewall."""

import json
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from app.config import settings
from app.db import get_session, init_db
from app.engine import (
    audio_analyzer,
    coercion,
    link_checker,
    ml_classifier,
    payee,
    upi_decoder,
)
from app.models.analysis_log import AnalysisLog


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str


class DecodeUpiRequest(BaseModel):
    text: str


class CheckLinkRequest(BaseModel):
    text: str


class PayeeRequest(BaseModel):
    vpa: str


class DisputeRequest(BaseModel):
    log_id: int


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def run_analysis(text: str, session: Session) -> dict:
    """The hybrid pipeline: rules + ML, logged. Shared by the text and
    audio endpoints so both score identically."""
    # 1. rules engine
    result = coercion.analyze(text)
    rd = result.to_dict()

    # 2. ML classifier, which can only escalate the score, never soften it
    ml = ml_classifier.ml_score(text)
    combined = ml_classifier.combine(rd["score"], ml)

    # keep the rules score visible alongside the combined one
    rd["rules_score"] = rd["score"]
    rd["score"] = combined["final_score"]
    rd["level"] = combined["level"]
    rd["ml"] = ml
    rd["detection_source"] = combined["source"]
    rd["detection_note"] = combined["note"]
    rd["language"] = rd["ml"]["language"]

    # every analysis is recorded so the user can see, and dispute, why
    entry = AnalysisLog(
        text_excerpt=text[:120],
        score=rd["score"],
        level=rd["level"],
        reasons_json=json.dumps(rd["reasons"]),
        disputed=False,
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)

    rd["log_id"] = entry.id
    return rd


@app.post("/api/analyze")
def analyze(
    request: AnalyzeRequest, session: Session = Depends(get_session)
) -> dict:
    return run_analysis(request.text, session)


@app.post("/api/decode-upi")
def decode_upi(request: DecodeUpiRequest) -> dict:
    return upi_decoder.decode_upi(request.text)


@app.post("/api/check-link")
def check_link(request: CheckLinkRequest) -> dict:
    return link_checker.check_link(request.text)


@app.post("/api/check-payee")
def check_payee(
    request: PayeeRequest, session: Session = Depends(get_session)
) -> dict:
    return payee.assess_payee(request.vpa, session)


@app.post("/api/report-payee")
def report_payee(
    request: PayeeRequest, session: Session = Depends(get_session)
) -> dict:
    return payee.report_payee(request.vpa, session)


@app.get("/api/logs")
def logs(session: Session = Depends(get_session)) -> list[dict]:
    rows = session.exec(
        select(AnalysisLog)
        .order_by(AnalysisLog.created_at.desc(), AnalysisLog.id.desc())
        .limit(20)
    ).all()
    return [
        {
            "id": row.id,
            "created_at": row.created_at.isoformat(),
            "text_excerpt": row.text_excerpt,
            "score": row.score,
            "level": row.level,
            "reasons": json.loads(row.reasons_json),
            "disputed": row.disputed,
        }
        for row in rows
    ]


@app.post("/api/dispute")
def dispute(
    request: DisputeRequest, session: Session = Depends(get_session)
) -> dict:
    entry = session.get(AnalysisLog, request.log_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Log entry not found")

    entry.disputed = True
    session.add(entry)
    session.commit()
    return {"ok": True, "log_id": entry.id}


@app.post("/api/analyze-audio")
async def analyze_audio(
    file: UploadFile = File(...), session: Session = Depends(get_session)
) -> dict:
    contents = await file.read()
    tr = audio_analyzer.transcribe_audio(contents, file.filename)

    if not tr["ok"]:
        return {
            "ok": False,
            "error": tr["error"],
            "transcript": "",
            "analysis": None,
        }

    return {
        "ok": True,
        "transcript": tr["transcript"],
        "audio_language": tr["language"],
        "duration": tr["duration"],
        "analysis": run_analysis(tr["transcript"], session),
    }
