@echo off
echo ========================================================
echo Starting EditBuddy - Personal Photo ^& Video Editing Tutor
echo ========================================================
echo.
echo Opening EditBuddy in your default web browser...
start http://localhost:8000
echo.
echo Starting local web server on port 8000...
echo (Press Ctrl+C to stop the server at any time)
echo.
python -m http.server 8000
