#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start AniSphere dev server locally (streaming works from residential IP).

.DESCRIPTION
    Changes to the project directory, runs `npm run dev`, and keeps the window open
    so you can see logs and stop it with Ctrl+C.

.NOTES
    Requires Node.js and npm in PATH. Run once after cloning; dependencies are already installed.
#>

$projectRoot = "D:\Zero\Projects\Anime"

if (-not (Test-Path $projectRoot)) {
    Write-Error "Project folder not found at $projectRoot"
    exit 1
}

Write-Host "Starting AniSphere dev server..." -ForegroundColor Cyan
Write-Host "Project: $projectRoot" -ForegroundColor Gray
Write-Host "Open http://localhost:3000 when it says 'Ready'" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host ""

Set-Location $projectRoot
npm run dev

# If npm exits (error or Ctrl+C), keep window open so you can read the message
Write-Host ""
Write-Host "Server stopped. Press any key to close..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")