#!/usr/bin/env pwsh
# =============================================================
# EduSphere Enterprise — One-Click Startup Script (Local Dev)
# Usage: .\start.ps1
#
# This runs ALL 15 services + frontend manually (no Docker).
# Prerequisites:
#   - MongoDB running locally on :27017 (or Atlas URI in .env)
#   - Redis running locally on :6379
#   - RabbitMQ running locally on :5672
#
# For Docker Compose mode, use instead:
#   npm run docker:up  (from repo root)
#   OR: docker compose -f infra/docker-compose.yml up --build
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

# Load env vars from root .env
if (Test-Path ".\.env") {
    Write-Step "📄" "Loading environment from .env..."
    Get-Content ".\.env" | Where-Object { $_ -match "^\s*[^#]" -and $_ -match "=" } | ForEach-Object {
        $parts = $_ -split "=", 2
        [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
    Write-Step "✅" "Environment loaded."
} else {
    Write-Step "⚠️" "No .env file found at root — services will use local defaults."
}

# ── 1. Install frontend deps if needed ───────────────────────────────────
Write-Step "📦" "Checking frontend dependencies..."
if (-not (Test-Path ".\frontend\node_modules")) {
    Write-Step "⬇" "Installing frontend packages (first time)..."
    Push-Location ".\frontend"
    & "npm" install
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
    '$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User"); Set-Location "' + $PWD + '\frontend"; & "npm" run dev'
) -PassThru -WindowStyle Normal

Write-Step "✅" "Frontend starting (PID: $($frontend.Id))"

# ── 3. Install and start all 15 backend services ──────────────────────────
$services = @(
    @{ Name = "auth-service";         Path = ".\backend\services\auth-service";         Script = "start" },
    @{ Name = "user-service";         Path = ".\backend\services\user-service";         Script = "start" },
    @{ Name = "course-service";       Path = ".\backend\services\course-service";       Script = "start" },
    @{ Name = "attendance-service";   Path = ".\backend\services\attendance-service";   Script = "start" },
    @{ Name = "notification-service"; Path = ".\backend\services\notification-service"; Script = "dev"   },
    @{ Name = "assessment-service";   Path = ".\backend\services\assessment-service";   Script = "dev"   },
    @{ Name = "assignment-service";   Path = ".\backend\services\assignment-service";   Script = "dev"   },
    @{ Name = "certificate-service";  Path = ".\backend\services\certificate-service";  Script = "dev"   },
    @{ Name = "admin-service";        Path = ".\backend\services\admin-service";        Script = "start" },
    @{ Name = "analytics-service";    Path = ".\backend\services\analytics-service";    Script = "start" },
    @{ Name = "calendar-service";     Path = ".\backend\services\calendar-service";     Script = "start" },
    @{ Name = "discussion-service";   Path = ".\backend\services\discussion-service";   Script = "start" },
    @{ Name = "library-service";      Path = ".\backend\services\library-service";      Script = "start" },
    @{ Name = "placement-service";    Path = ".\backend\services\placement-service";    Script = "start" },
    @{ Name = "timetable-service";    Path = ".\backend\services\timetable-service";    Script = "start" }
)

$runningServices = @()

foreach ($svc in $services) {
    $svcPath = $svc.Path
    if (Test-Path "$svcPath\package.json") {
        Write-Step "📦" "Installing $($svc.Name) deps..."
        if (-not (Test-Path "$svcPath\node_modules")) {
            Push-Location $svcPath
            & "npm" install --silent 2>$null
            Pop-Location
        }

        Write-Step "🚀" "Starting $($svc.Name)..."
        $proc = Start-Process powershell -ArgumentList @(
            "-NoProfile",
            "-Command",
            '$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User"); Set-Location "' + (Resolve-Path $svcPath) + '"; & "npm" run ' + $svc.Script + ' 2>&1'
        ) -PassThru -WindowStyle Normal
        $runningServices += @{ Name = $svc.Name; Process = $proc }
        Write-Step "✅" "$($svc.Name) starting (PID: $($proc.Id))"
    } else {
        Write-Step "⚠️" "Skipping $($svc.Name) — package.json not found at $svcPath"
    }
}

# ── 4. Wait and open browser ─────────────────────────────────────────────
Write-Host ""
Write-Step "⏳" "Waiting 5 seconds for services to initialize..."
Start-Sleep -Seconds 5

Write-Header "EduSphere is Running!"

Write-Host "  🌐  Frontend:            http://localhost:5173" -ForegroundColor Yellow
Write-Host "  🔐  Auth API:            http://localhost:3001/health" -ForegroundColor Yellow
Write-Host "  👥  User API:            http://localhost:3002/health" -ForegroundColor Yellow
Write-Host "  📚  Course API:          http://localhost:3003/health" -ForegroundColor Yellow
Write-Host "  🔔  Notification API:    http://localhost:3004/health" -ForegroundColor Yellow
Write-Host "  ⚡  Assessment API:      http://localhost:3005/health" -ForegroundColor Yellow
Write-Host "  📝  Assignment API:      http://localhost:3006/health" -ForegroundColor Yellow
Write-Host "  🏆  Certificate API:     http://localhost:3007/health" -ForegroundColor Yellow
Write-Host "  📅  Attendance API:      http://localhost:3008/health" -ForegroundColor Yellow
Write-Host "  🗓️  Timetable API:       http://localhost:3009/health" -ForegroundColor Yellow
Write-Host "  📆  Calendar API:        http://localhost:3010/health" -ForegroundColor Yellow
Write-Host "  📖  Library API:         http://localhost:3011/health" -ForegroundColor Yellow
Write-Host "  💼  Placement API:       http://localhost:3012/health" -ForegroundColor Yellow
Write-Host "  💬  Discussion API:      http://localhost:3013/health" -ForegroundColor Yellow
Write-Host "  📊  Analytics API:       http://localhost:3014/health" -ForegroundColor Yellow
Write-Host "  🛡️  Admin API:           http://localhost:3015/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "  🎓  Demo Credentials:" -ForegroundColor Magenta
Write-Host "      Student    : john_doe / demo123" -ForegroundColor White
Write-Host "      Student    : jane_smith / demo123" -ForegroundColor White
Write-Host "      Faculty    : sarah_j / demo123" -ForegroundColor White
Write-Host "      Admin      : sys_admin / demo123" -ForegroundColor White
Write-Host "      Management : dean_academic / demo123" -ForegroundColor White
Write-Host ""
Write-Host "  📊  Smoke test:  node backend/scripts/smoke-test.js" -ForegroundColor DarkCyan
Write-Host "  🌱  Seed data:   node backend/scripts/seed.js" -ForegroundColor DarkCyan
Write-Host ""

# Open browser
try {
    Start-Process "http://localhost:5173"
    Write-Step "🌍" "Opening browser..."
} catch {
    Write-Host "  Please open http://localhost:5173 manually" -ForegroundColor Yellow
}

Write-Host "`n  Press Ctrl+C to stop all services`n" -ForegroundColor DarkGray

# Keep script alive and handle shutdown
try {
    while ($true) { Start-Sleep -Seconds 60 }
} finally {
    Write-Host "`nShutting down all services..." -ForegroundColor Red
    if ($frontend -and !$frontend.HasExited) { $frontend.Kill() }
    foreach ($svc in $runningServices) {
        if ($svc.Process -and !$svc.Process.HasExited) { $svc.Process.Kill() }
    }
    Write-Host "Done." -ForegroundColor Green
}
