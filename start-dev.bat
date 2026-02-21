@echo off
echo ==========================================
echo   Starting CMMS Development Environment
echo ==========================================

echo.
echo [1/2] Launching Backend (Spring Boot)...
start "CMMS Backend" cmd /k "cd backend && gradlew bootRun"

echo.
echo [2/2] Launching Frontend (Vite)...
start "CMMS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo   Processes have been launched in new windows.
echo   Please check the separate windows for logs.
echo ==========================================
