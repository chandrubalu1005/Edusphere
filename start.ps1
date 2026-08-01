#!/usr/bin/env pwsh
# =============================================================
# EduSphere Enterprise — One-Click Startup Script
# Usage: .\start.ps1
# =============================================================

$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

function Write-Header([string]$msg) {
    Write-Host "`n══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "══════════════════════════════════════════`n" -ForegroundColor Cyan
}

function Write-Step([string]$emoji, [string]$msg) {
    Write-Host "$emoji  $msg" -ForegroundColor Green
}

Write-Header "EduSphere Enterprise v2.0 — Starting Up"

# ── 1. Install frontend deps if needed ───────────────────────────────────
Write-Step "📦" "Checking frontend dependencies..."
if (-not (Test-Path ".\frontend\node_modules")) {
    Write-Step "⬇" "Installing frontend packages (first time)..."
    Push-Location ".\frontend"
    & "C:\Program Files\nodejs\npm.cmd" install
    Pop-Location
    Write-Step "✅" "Frontend deps installed."
} else {
    Write-Step "✅" "Frontend deps already installed."
}

# ── 2. Start Frontend ────────────────────────────────────────────────────
Write-Step "🌐" "Starting frontend dev server on http://localhost:5173 ..."
$frontend = Start-Process powershell -ArgumentList @(
    "-NoProfile",
    "-Command",
    '$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User"); Set-Location "' + $PWD + '\frontend"; & "C:\Program Files\nodejs\npm.cmd" run dev'
) -PassThru -WindowStyle Normal

Write-Step "✅" "Frontend starting (PID: $($frontend.Id))"

# ── 3. Install and start backend services ────────────────────────────────
$services = @("auth-service", "user-service", "course-service", "attendance-service", "notification-service", "assessment-service", "assignment-service", "certificate-service")
$runningServices = @()

foreach ($svc in $services) {
    $svcPath = ".\services\$svc"
    if (Test-Path "$svcPath\package.json") {
        Write-Step "📦" "Installing $svc deps..."
        if (-not (Test-Path "$svcPath\node_modules")) {
            Push-Location $svcPath
            & "C:\Program Files\nodejs\npm.cmd" install --silent 2>$null
            Pop-Location
        }

        Write-Step "🚀" "Starting $svc..."
        $proc = Start-Process powershell -ArgumentList @(
            "-NoProfile",
            "-Command",
            '$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User"); Set-Location "' + (Resolve-Path $svcPath) + '"; & "C:\Program Files\nodejs\npm.cmd" run dev 2>&1'
        ) -PassThru -WindowStyle Normal
        $runningServices += @{ Name = $svc; Process = $proc }
        Write-Step "✅" "$svc starting (PID: $($proc.Id))"
    }
}

# ── 4. Wait and open browser ─────────────────────────────────────────────
Write-Host ""
Write-Step "⏳" "Waiting 3 seconds for services to initialize..."
Start-Sleep -Seconds 3

Write-Header "EduSphere is Running!"

Write-Host "  🌐  Frontend:      http://localhost:5173" -ForegroundColor Yellow
Write-Host "  🔐  Auth API:      http://localhost:3001/health" -ForegroundColor Yellow
Write-Host "  👥  User API:      http://localhost:3002/health" -ForegroundColor Yellow
Write-Host "  📚  Course API:    http://localhost:3003/health" -ForegroundColor Yellow
Write-Host "  📅  Attendance:    http://localhost:3008/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "  🎓  Demo Credentials:" -ForegroundColor Magenta
Write-Host "      Student    : john_doe / demo123" -ForegroundColor White
Write-Host "      Faculty    : sarah_j / demo123" -ForegroundColor White
Write-Host "      Admin      : sys_admin / demo123" -ForegroundColor White
Write-Host "      Management : dean_academic / demo123" -ForegroundColor White
Write-Host ""

# Open browser
try {
    Start-Process "http://localhost:5173"
    Write-Step "🌍" "Opening browser..."
} catch {
    Write-Host "  Please open http://localhost:5173 manually" -ForegroundColor Yellow
}

Write-Host "`n  Press Ctrl+C to stop all services`n" -ForegroundColor DarkGray

# Keep script alive
try {
    while ($true) { Start-Sleep -Seconds 60 }
} finally {
    Write-Host "`nShutting down..." -ForegroundColor Red
    $frontend.Kill()
    foreach ($svc in $runningServices) { $svc.Process.Kill() }
}
