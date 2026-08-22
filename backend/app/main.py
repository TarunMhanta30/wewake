"""wewake — coercion-aware financial fraud firewall."""

import json
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from app.config import settings
from app.db import get_session, init_db
from app.engine import coercion, link_checker, payee, upi_decoder
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


@app.post("/api/analyze")
def analyze(
    request: AnalyzeRequest, session: Session = Depends(get_session)
) -> dict:
    result = coercion.analyze(request.text).to_dict()

    # every analysis is recorded so the user can see, and dispute, why
    entry = AnalysisLog(
        text_excerpt=request.text[:120],
        score=result["score"],
        level=result["level"],
        reasons_json=json.dumps(result["reasons"]),
        disputed=False,
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)

    return {**result, "log_id": entry.id}


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
