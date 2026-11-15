# DEPLOYMENT & EXECUTION GUIDE

## Prerequisites
- **Python**: 3.10+ (Current system: Python 3.13)
- **Node.js**: 18+ (Current system: Node.js v22.19)
- **Package Managers**: `npm` / `pip`
- **Docker & Docker Compose** (for containerized deployment)

---

## 1. Production Cloud Deployment Architecture

```
[User Browser]
      │
      ▼
[Vercel: Next.js 14 Frontend SaaS]
      │
      ├──────────────────────────────────────────────┐
      │ NEXT_PUBLIC_API_URL                          │ NEXT_PUBLIC_AI_API_URL
      ▼                                              ▼
[Render: Node.js Express Backend]          [Render: Python FastAPI AI Service]
      │                                              ▲
      │ AI_SERVICE_URL                               │
      └──────────────────────────────────────────────┘
      │
      ▼
[PostgreSQL / Supabase Database]
```

### A. Vercel Frontend Environment Variables
In your **Vercel Dashboard** -> **Project Settings** -> **Environment Variables**, add:

| Variable Name | Description | Example Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Deployed Express.js Application Backend | `https://agri-backend.onrender.com` |
| `NEXT_PUBLIC_AI_API_URL` | Deployed FastAPI AI & OR-Tools Service | `https://agri-ai-service.onrender.com` |

*Note: In production builds, the frontend enforces these variables. It will never silently fall back to localhost in production mode.*

### B. Render Node.js Backend Environment Variables
In your **Render Web Service (Node.js Backend)** settings, configure:

| Variable Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (or Render default `$PORT`) |
| `AI_SERVICE_URL` | `https://agri-ai-service.onrender.com` |
| `JWT_SECRET` | `your-secure-jwt-secret-string` |
| `FRONTEND_URL` | `https://your-frontend-app.vercel.app` |
| `ALLOWED_ORIGINS` | `https://your-frontend-app.vercel.app,http://localhost:3000` |

### C. Render FastAPI AI Service Environment Variables
In your **Render Web Service (Python AI Service)** settings, configure:

| Variable Name | Value |
|---|---|
| `PORT` | `8000` (or Render default `$PORT`) |
| `ENVIRONMENT` | `production` |
| `FRONTEND_URL` | `https://your-frontend-app.vercel.app` |
| `ALLOWED_ORIGINS` | `https://your-frontend-app.vercel.app,http://localhost:3000` |

---

## 2. Quick Local Execution

### Step A: Start the AI Service (FastAPI)
```bash
cd ai_service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation & Swagger UI will be available at: `http://localhost:8000/docs`

### Step B: Start the Application Backend (Node.js/Express)
```bash
cd backend
npm install
npm run dev
```
Backend API will be running at: `http://localhost:5000`

### Step C: Start the Frontend Application (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Web Application will be accessible at: `http://localhost:3000`

---

## 3. Docker Compose Multi-Container Deployment
```bash
docker-compose up --build
```
This boots:
1. `db`: PostgreSQL 15 with PostGIS spatial extension.
2. `ai_service`: FastAPI with PyTorch, OR-Tools, LightGBM, XGBoost.
3. `backend`: Express.js orchestration server.
4. `frontend`: Next.js production SSR container.
