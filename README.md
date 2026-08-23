# WEWAKE
### India's first coercion-aware financial firewall
**Wake up before you pay.**

Built for **Prasunethon 2.0** (Cybersecurity Track) — Round 2 Submission
Team: **Solora** (Solo Participant) — **Tarun Mhanta**
Repository: https://github.com/TarunMhanta30/wewake

---

## The Problem

In almost every major Indian cyber fraud, nothing is hacked. No password is broken. A calm, intelligent adult is frightened for hours — and transfers the money themselves.

- ₹22,495 crore lost to cyber fraud in India in 2025 alone
- ₹4,057.7 crore lost specifically to "digital arrest" scams (2022–May 2026)
- 51% of UPI fraud victims never report the incident
- Only 6.7% of stolen money is ever recovered

Existing defenses sit at two ends: **banks** see a risk score the citizen never sees, and **police/1930/cybercrime.gov.in** only act after the money is already gone. The gap in the middle — the 20 minutes to 6 months during which a victim is being psychologically coerced into paying — is undefended.

## The Idea

Every other fraud tool asks: **"Is this message or link fake?"**
WEWAKE asks: **"Is this person being controlled right now?"**

Scam links change every hour. The human coercion script — fake authority, a frightening accusation, a demand for secrecy, urgency, and isolation — does not. WEWAKE detects that script and buys back the victim's judgement before the money leaves.

---

## Architecture — 4 Pillars, 15 Features

### 🔍 DRISHTI — See the trap
| # | Feature | What it does |
|---|---|---|
| 1 | **UPI Request Decoder** | Parses a UPI payment link and tells the user in plain language whether money will LEAVE or is a collect request that will debit them. |
| 2 | **Link & App Checker** | Rule-based scoring of any pasted link — brand impersonation, suspicious TLDs, URL shorteners, insecure links. |
| 3 | **First-Time Payee Check** | Community-reported UPI ID registry. Shows fraud report count and risk level before paying a stranger; users can report new fraud IDs. |

### 🧠 SAMVAAD — Read the pressure
| # | Feature | What it does |
|---|---|---|
| 4 | **Coercion Script Engine** | Matches pasted text against 7 documented Indian scam scripts (digital arrest, courier/parcel, UPI collect, KYC block, refund reversal, job-fee, investment/lottery) and returns a match with confidence. |
| 5 | **Authority Truth Card** | Displays the specific, factual truth for the matched scam — e.g. "There is NO such thing as a 'digital arrest' in Indian law." |
| 6 | **Secrecy Trigger** | Detects "don't tell your family" and equivalent phrases — the single highest-signal phrase across real cases — and fires the loudest alert in the app. |
| 13 | **Hybrid ML Classifier** | A trained scikit-learn model (TF-IDF + character n-grams + Logistic Regression) runs alongside the rules engine. It catches **reworded scams that contain zero rule-matched keywords** — verified in testing to flag evasive phrasing the rules score 0 on. |
| 14 | **Multilingual Detection** | The same coercion elements are detected in **Hindi and Marathi**, in both Devanagari and Romanized script. Corpus extended with 225+ vernacular phrases; ML threshold is language-aware to prevent false positives where training data is sparser. |

### ⏸️ VILAMB — Break the trance
| # | Feature | What it does |
|---|---|---|
| 7 | **Cooling Timer** | A forced, unskippable wait before the user can proceed — length scaled to the danger *level*, not the rupee amount (60s DANGER / 30s HIGH / 15s CAUTION). |
| 8 | **Circuit Breaker** | The user must type, unprompted, *why* they are sending money. Their own typed reason is run back through the coercion engine — if it echoes a scam script, WEWAKE shows them their own words matched against the fraud pattern. |
| 9 | **Reverse Verification** | One-tap access to real, verified Indian helpline numbers (1930, RBI 14440, TRAI 1909, Chakshu, Police 112, Women's Helpline 181) — never the number a scammer provides. |

### 🚨 RAKSHAK — Protect and prove
| # | Feature | What it does |
|---|---|---|
| 10 | **Golden Hour Mode** | A live 60-minute countdown paired with the exact, correctly-ordered recovery checklist (block card → call bank → call 1930 → file at cybercrime.gov.in within 24h → dispute in UPI app → save evidence). |
| 11 | **Evidence File Generator** | Auto-formats a complete cyber-fraud complaint from user input, ready to file at cybercrime.gov.in / 1930, with unfilled fields clearly marked. Copy or download as .txt. |
| 12 | **Why-It-Flagged Log** | Every analysis is logged with its full reasoning. Nothing is a black box — users can view history and dispute any flag, which is recorded for review. |
| 15 | **Audio Scam-Call Analyzer** | Upload a recording of a suspicious call. WEWAKE transcribes it (faster-whisper, CPU-optimized) and runs the transcript through the full hybrid, multilingual coercion engine — the same detection, applied to real speech. |

---

## Why This Is Different

| | Caller-ID / spam apps | Bank-side AI (FRI/DIP) | Reporting portals (1930, Chakshu) | **WEWAKE** |
|---|---|---|---|---|
| Detects the fake number/link | Yes | Partly | No | Yes |
| Detects the victim being coerced | No | No | No | **Yes** |
| Acts during the scam, not after | No | Partly | No | **Yes** |
| Adds friction sized by pressure | No | No | No | **Yes** |
| Explains and lets you appeal it | No | No | No | **Yes** |

---

## Technology Stack

**Frontend:** React 18 + Vite, Tailwind CSS, mobile-first responsive design
**Backend:** Python 3, FastAPI, SQLModel + SQLite
**Detection Engine:** Rule-based scoring (11 psychological elements, 7 scam scripts, 3 languages) + scikit-learn hybrid classifier (TF-IDF word + character n-grams, Logistic Regression)
**Audio:** faster-whisper (CTranslate2-based, CPU-optimized transcription)
**Data:** Community-sourced payee reputation registry, full decision-audit log

### Deliberately NOT used, and why that's a feature
No live call interception (Android restricts this — audio analysis works on uploaded/recorded clips instead, honestly scoped). No bank API dependency. No claimed government API access — the Evidence File generates a ready-to-submit document rather than falsely claiming automated filing. Every limitation here is a stated, deliberate design boundary, not an oversight.

---

## Local Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python train_model.py          # trains the ML classifier (first time only)
uvicorn app.main:app --reload
```
Runs at `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173` (or next available port)

Set `VITE_API_URL` in `frontend/.env` to point at the backend if not running locally.

---

## Demo Video

**Full walkthrough (YouTube):** https://youtu.be/nyLTsfgMTlI

## Running the Project

WEWAKE runs locally with the setup steps above (backend on `localhost:8000`, frontend on `localhost:5173`). The full demo — all 15 features including the audio scam-call analyzer — is shown in the demo video linked above.

---

## Project Links

- **GitHub Repository:** https://github.com/TarunMhanta30/wewake
- **Cyber Crime Helpline:** 1930
- **National Cyber Crime Reporting Portal:** https://cybercrime.gov.in

---

## Roadmap Beyond This Hackathon

- Expand vernacular coverage to additional Indian languages
- Federated threat-narrative sharing across users (no raw data leaves device)
- Webhook bridge so a bank or PSP could consume the duress signal directly
- Live call analysis pending Android accessibility-service pathways

---

## Team

**Solora** — Solo Participant: **Tarun Mhanta**
MCA, Cybersecurity & AI, Jain University
tarunmhanta30@gmail.com
