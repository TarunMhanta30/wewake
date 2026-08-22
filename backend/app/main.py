"""wewake — coercion-aware financial fraud firewall."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.db import init_db
from app.engine import coercion, upi_decoder


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
