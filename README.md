# wewake

A coercion-aware financial fraud firewall.

**Status: skeleton.** No scoring logic, no real UI. The only thing this proves is
that text typed in the browser reaches the backend and the response renders.

## Layout

```
backend/         FastAPI + SQLModel (SQLite)
  app/main.py    app, CORS, /api/health, /api/analyze
  app/config.py  pydantic-settings
  app/db.py      engine + auto-create tables on startup
  app/models/    pydantic schemas
  app/engine/    scoring logic (empty)
  app/data/      JSON seed files
frontend/        React 18 + Vite + Tailwind, mobile-first
  src/lib/api.js axios wrapper, base URL from VITE_API_URL
```

## Backend

Requires Python 3.11+. Dependency pins are lower bounds so the same file installs
on 3.11 through 3.14.

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

- Health: http://localhost:8000/api/health
- Docs: http://localhost:8000/docs
- SQLite file `backend/wewake.db` is created on first start.

Smoke test:

```bash
curl http://localhost:8000/api/health
curl -X POST http://localhost:8000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"text":"hello"}'
```

## Frontend

Requires Node 18+.

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:5173 — type text, hit Analyze, see the raw JSON.

## Deploy notes

`backend/Procfile` targets Railway:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Set `CORS_ORIGINS` to the real frontend origin before going public — it currently
allows all origins.
