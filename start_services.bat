@echo off
TITLE AgriOptima Local Development Server Launcher
echo =======================================================================
echo STARTING AGRIOPTIMA AUTONOMOUS PLATFORM SERVICES
echo =======================================================================

echo 1. Starting FastAPI AI & Optimization Service on Port 8000...
start "AgriOptima AI Service" cmd /k "cd ai_service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo 2. Starting Node.js Express Backend on Port 5000...
start "AgriOptima Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 3. Starting Next.js Frontend Application on Port 3000...
start "AgriOptima Frontend" cmd /k "cd frontend && npm run dev"

echo =======================================================================
echo ALL SERVICES LAUNCHED SUCCESSFULLY!
echo - Web Application: http://localhost:3000
echo - Backend API:     http://localhost:5000/health
echo - AI Service Docs: http://localhost:8000/docs
echo =======================================================================
pause
