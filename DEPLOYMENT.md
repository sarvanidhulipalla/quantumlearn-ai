# QuantumLearn AI — Production Deployment Guide

This guide provides end-to-end instructions for deploying the **QuantumLearn AI** web application (FastAPI backend + React Vite frontend) to production environments such as **Render**, **Railway**, **Fly.io**, **Vercel**, **Netlify**, or standard Docker containers.

---

## 1. Architecture Overview

```text
[ Users (Browser / Mobile / Desktop) ]
                 |
                 v
[ Frontend: React 19 + Vite (Vercel / Netlify / Cloudflare Pages) ]
                 |  HTTPS API requests (CORS Protected)
                 v
[ Backend: FastAPI (Python 3.12+) (Render / Railway / Fly.io / VPS) ]
        |              |                  |
        v              v                  v
[ PostgreSQL ]   [ Qiskit Aer ]   [ Verified RAG Knowledge Engine ]
```

---

## 2. Environment Variables Matrix

### Backend Environment Variables

| Variable | Required in Prod | Default (Dev) | Description |
|---|---|---|---|
| `ENVIRONMENT` | Yes | `development` | Set to `production` in live environments. |
| `PROJECT_NAME` | No | `QuantumLearn AI` | Platform name. |
| `JWT_SECRET` | **Yes** | *insecure-dev-key* | 32+ character random secret (e.g. `openssl rand -hex 32`). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `10080` (7 days) | JWT expiration time in minutes. |
| `DATABASE_URL` | **Yes** | `sqlite:///./quantumlearn.db` | PostgreSQL connection URI. |
| `CORS_ALLOWED_ORIGINS` | **Yes** | `http://localhost:5173,...` | Comma-separated list of allowed frontend production domains. |
| `AI_API_KEY` | Optional | `""` | Google Gemini API Key for dynamic RAG generation. |
| `AI_PROVIDER` | No | `gemini` | AI LLM provider. |
| `AI_MODEL` | No | `gemini-1.5-flash` | Gemini model name. |
| `EMBEDDING_MODEL` | No | `text-embedding-004` | Embedding model for semantic search. |
| `DEFAULT_SHOTS` | No | `1024` | Default simulation shots. |
| `MAX_QUBITS` | No | `12` | Upper bound for simulation sandbox. |

### Frontend Environment Variables

| Variable | Required in Prod | Default (Dev) | Description |
|---|---|---|---|
| `VITE_API_URL` | **Yes** | `http://127.0.0.1:8000/api/v1` | Public URL of the deployed FastAPI backend. |

---

## 3. Database Deployment (PostgreSQL)

QuantumLearn AI is fully compatible with **PostgreSQL 14+** (e.g. Supabase, Neon, AWS RDS, Render Postgres, Railway Postgres).

1. Create a PostgreSQL database instance on your provider.
2. Obtain the connection string:
   ```text
   postgresql://quantum_user:your_secure_password@db-host:5432/quantumlearn_db
   ```
3. Set `DATABASE_URL` in the backend environment.
4. On startup, FastAPI automatically performs schema initialization and migrations through `Base.metadata.create_all()` and seeds essential initial data without dropping existing records.

---

## 4. Backend Deployment Options

### Option A: Render / Railway / Fly.io

1. **Root Directory:** `backend`
2. **Build Command:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Start Command:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. **Environment Variables:** Set all required variables from the matrix above.
5. **Health Check Path:** `/api/v1/health`

### Option B: Docker Container

Create a `Dockerfile` in `backend/`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for C extensions / Qiskit
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t quantumlearn-backend ./backend
docker run -p 8000:8000 --env-file ./backend/.env quantumlearn-backend
```

---

## 5. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)

1. **Root Directory:** `frontend`
2. **Framework Preset:** Vite
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment Variables:**
   - `VITE_API_URL=https://api.yourdomain.com/api/v1`
6. **SPA Routing Rewrite Rule:**
   - **Vercel (`vercel.json`):**
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
   - **Netlify (`_redirects` in `frontend/public/`):**
     ```text
     /*    /index.html   200
     ```

---

## 6. Security & Hardening Checklist

- [x] **CORS Origins:** Only allowed domains specified in `CORS_ALLOWED_ORIGINS`.
- [x] **Secret Isolation:** Passwords and JWT secrets are loaded via environment variables; never committed to git.
- [x] **Quantum Sandbox:** Qubit count bounded between 1 and 12; maximum 100 gates per circuit; shots bounded between 128 and 8192.
- [x] **Role Authorization:** Instructor and Admin endpoints return HTTP 403 Forbidden to unauthorized accounts.
- [x] **IDOR Protection:** Student progress, AI conversation histories, and quiz attempts are isolated by user ID.
- [x] **Sanitized Error Responses:** Internal stack traces and database details are suppressed in production mode.
