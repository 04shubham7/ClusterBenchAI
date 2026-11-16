@echo off
title ClusterBenchAI Backend Server
echo ===================================================
echo   ClusterBenchAI: Starting FastAPI Backend Server
echo   URL: http://127.0.0.1:8000
echo ===================================================
cd /d "%~dp0"
python run.py
pause
