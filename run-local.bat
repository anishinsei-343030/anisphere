@echo off
title AniSphere Local Dev Server
cd /d "D:\Zero\Projects\Anime"
echo Starting AniSphere dev server...
echo Open http://localhost:3000 when it says "Ready"
echo Press Ctrl+C to stop.
echo.
npm run dev
echo.
echo Server stopped. Press any key to close...
pause >nul