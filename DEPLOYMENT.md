# DEPLOYMENT & EXECUTION GUIDE

## Prerequisites
- **Python**: 3.10+ (Current system: Python 3.13)
- **Node.js**: 18+ (Current system: Node.js v22.19)
- **Package Managers**: `npm` / `pip`
- **Docker & Docker Compose** (for containerized deployment)

---

## 1. Quick Local Execution

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

## 2. Docker Compose Multi-Container Deployment
```bash
docker-compose up --build
```
This boots:
1. `db`: PostgreSQL 15 with PostGIS spatial extension.
2. `ai_service`: FastAPI with PyTorch, OR-Tools, LightGBM, XGBoost.
3. `backend`: Express.js orchestration server.
4. `frontend`: Next.js production SSR container.
