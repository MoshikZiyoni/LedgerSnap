@echo off
echo Starting BankToQBO Backend & Frontend...
start cmd /k ".\venv\Scripts\activate && uvicorn backend.main:app --port 8000 --reload"
cd frontend
start cmd /k "npm run dev"
echo Backend running on http://localhost:8000
echo Frontend starting on http://localhost:5173
pause
