# AgriOptima PowerShell Service Launcher
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "STARTING AGRIOPTIMA AUTONOMOUS PLATFORM SERVICES" -ForegroundColor Green
Write-Host "=======================================================================" -ForegroundColor Cyan

Write-Host "1. Launching FastAPI AI & Optimization Service (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai_service; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "2. Launching Node.js Express Application Backend (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Start-Sleep -Seconds 3

Write-Host "3. Launching Next.js Frontend Application (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "ALL SERVICES LAUNCHED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "  -> Frontend App:     http://localhost:3000" -ForegroundColor White
Write-Host "  -> Backend API:      http://localhost:5000/health" -ForegroundColor White
Write-Host "  -> AI Service Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "=======================================================================" -ForegroundColor Cyan
