"""wewake — coercion-aware financial fraud firewall."""

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session

from app.config import settings
from app.db import get_session, init_db
from app.engine import coercion, link_checker, payee, upi_decoder


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


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze")
def analyze(request: AnalyzeRequest) -> dict:
    result = coercion.analyze(request.text)
    return result.to_dict()


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
