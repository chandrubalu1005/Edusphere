#!/usr/bin/env pwsh
# =============================================================
# EduSphere Enterprise — One-Click Startup Script (Local Dev)
# Usage: .\start.ps1
# =============================================================

function Write-Header([string]$msg) {
    Write-Host "`n══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "══════════════════════════════════════════`n" -ForegroundColor Cyan
}

function Write-Step([string]$emoji, [string]$msg) {
    Write-Host "$emoji  $msg" -ForegroundColor Green
}

function Write-ErrorMsg([string]$msg) {
    Write-Host "❌  $msg" -ForegroundColor Red
}

Write-Header "EduSphere Enterprise v2.0 — Starting Up"

# Ensure logs directory exists
$logDir = ".\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

$pidFile = "$logDir\.edusphere.pids"
if (Test-Path $pidFile) { Remove-Item $pidFile -Force -ErrorAction SilentlyContinue }


# ── 1. Load Environment ────────────────────────────────────────────────
if (Test-Path ".\.env") {
    Write-Step "📄" "Loading environment from .env..."
    Get-Content ".\.env" | Where-Object { $_ -match "^\s*[^#]" -and $_ -match "=" } | ForEach-Object {
        $parts = $_ -split "=", 2
        [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
} else {
    Write-Step "⚠️" "No .env file found at root — services will use local defaults."
}

# ── 2. Cleanup Existing Processes ──────────────────────────────────────
Write-Step "🧹" "Cleaning up any existing EduSphere processes..."
& ".\stop.ps1"

# ── 3. Check/Install Frontend Deps ─────────────────────────────────────
Write-Step "📦" "Checking frontend dependencies..."
if (-not (Test-Path ".\frontend\node_modules")) {
    Write-Step "⬇" "Installing frontend packages (first time)..."
    Push-Location ".\frontend"
    $npmProc = Start-Process -FilePath "npm.cmd" -ArgumentList "install" -Wait -PassThru -NoNewWindow
    if ($npmProc.ExitCode -ne 0) {
        Write-ErrorMsg "Frontend npm install failed with exit code $($npmProc.ExitCode). Halting."
        Pop-Location
        exit 1
    }
    Pop-Location
}

# ── 3.5 Infrastructure Pre-flight Check ────────────────────────────────
Write-Step "🔍" "Skipping local MongoDB check (using .env configuration)..."

# Array to keep track of started processes
$runningServices = @()

# ── Helper to start process ────────────────────────────────────────────
function Start-ServiceProcess {
    param(
        [string]$Name,
        [string]$Path,
        [string]$CommandArgs,
        [int]$Port,
        [string]$HealthPath
    )
    
    $logFile = "$logDir\$Name.log"
    $errLogFile = "$logDir\err_$Name.log"

    $resolvedPath = Resolve-Path $Path
    $proc = Start-Process -FilePath "npm.cmd" -ArgumentList $CommandArgs -WorkingDirectory $resolvedPath -WindowStyle Hidden -RedirectStandardOutput $logFile -RedirectStandardError $errLogFile -PassThru

    # Track root process ID
    Add-Content -Path $pidFile -Value $proc.Id

    $obj = New-Object PSObject -Property @{
        Name = $Name
        Process = $proc
        Port = $Port
        HealthPath = $HealthPath
        LogFile = $logFile
        IsHealthy = $false
    }
    $script:runningServices += $obj
    
    Write-Step "🚀" "Started $Name (PID: $($proc.Id)) -> $logFile"
}

# ── 4. Start Services ──────────────────────────────────────────────────
Write-Step "🌐" "Starting Frontend..."
Start-ServiceProcess -Name "frontend" -Path ".\frontend" -CommandArgs "run dev" -Port 5173 -HealthPath "http://127.0.0.1:5173/index.html"

$backendServices = @(
    @{ Name = "auth-service";         Path = ".\backend\services\auth-service";         Script = "run start"; Port = 3001 },
    @{ Name = "user-service";         Path = ".\backend\services\user-service";         Script = "run start"; Port = 3002 },
    @{ Name = "course-service";       Path = ".\backend\services\course-service";       Script = "run start"; Port = 3003 },
    @{ Name = "attendance-service";   Path = ".\backend\services\attendance-service";   Script = "run start"; Port = 3008 },
    @{ Name = "notification-service"; Path = ".\backend\services\notification-service"; Script = "run dev";   Port = 3004 },
    @{ Name = "assessment-service";   Path = ".\backend\services\assessment-service";   Script = "run dev";   Port = 3005 },
    @{ Name = "assignment-service";   Path = ".\backend\services\assignment-service";   Script = "run dev";   Port = 3006 },
    @{ Name = "certificate-service";  Path = ".\backend\services\certificate-service";  Script = "run dev";   Port = 3007 },
    @{ Name = "admin-service";        Path = ".\backend\services\admin-service";        Script = "run start"; Port = 3015 },
    @{ Name = "analytics-service";    Path = ".\backend\services\analytics-service";    Script = "run start"; Port = 3014 },
    @{ Name = "calendar-service";     Path = ".\backend\services\calendar-service";     Script = "run start"; Port = 3010 },
    @{ Name = "discussion-service";   Path = ".\backend\services\discussion-service";   Script = "run start"; Port = 3013 },
    # @{ Name = "library-service";      Path = ".\backend\services\library-service";      Script = "run start"; Port = 3011 },
    @{ Name = "placement-service";    Path = ".\backend\services\placement-service";    Script = "run start"; Port = 3012 },
    @{ Name = "timetable-service";    Path = ".\backend\services\timetable-service";    Script = "run start"; Port = 3009 },
    @{ Name = "finance-service";      Path = ".\backend\services\finance-service";      Script = "run start"; Port = 3016 }
)

Write-Step "📦" "Checking backend dependencies..."
if (-not (Test-Path ".\backend\node_modules")) {
    Push-Location ".\backend"
    Write-Host "  Installing dependencies for backend workspace..." -ForegroundColor DarkGray
    $npmProc = Start-Process -FilePath "npm.cmd" -ArgumentList "install" -Wait -PassThru -NoNewWindow
    if ($npmProc.ExitCode -ne 0) {
        Write-ErrorMsg "Backend npm install failed with exit code $($npmProc.ExitCode). Halting."
        Pop-Location
        exit 1
    }
    Pop-Location
}

foreach ($svc in $backendServices) {
    if (Test-Path "$($svc.Path)\package.json") {
        Start-ServiceProcess -Name $svc.Name -Path $svc.Path -CommandArgs $svc.Script -Port $svc.Port -HealthPath "http://127.0.0.1:$($svc.Port)/health"
    } else {
        Write-Host "⚠️  Skipping $($svc.Name) — package.json not found" -ForegroundColor Yellow
    }
}

# ── 5. Health Checking (Polling) ───────────────────────────────────────
Write-Step "⏳" "Waiting for all services to become healthy (timeout: 60s)..."

$timeoutSeconds = 60
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$allHealthy = $false

while ($stopwatch.Elapsed.TotalSeconds -lt $timeoutSeconds) {
    $allHealthy = $true
    
    foreach ($svc in $runningServices) {
        if ($svc.IsHealthy) { continue }
        
        # Check if process crashed
        if ($svc.Process.HasExited) {
            Write-ErrorMsg "$($svc.Name) crashed! Exit code: $($svc.Process.ExitCode)"
            Write-ErrorMsg "Check log: $($svc.LogFile)"
            # Print last few lines of log
            if (Test-Path $svc.LogFile) {
                Get-Content $svc.LogFile -Tail 10 | ForEach-Object { Write-Host "  > $_" -ForegroundColor DarkRed }
            }
            Write-Host "Shutting down remaining services..." -ForegroundColor Yellow
            & ".\stop.ps1"
            exit 1
        }
        
        try {
            $response = Invoke-WebRequest -Uri $svc.HealthPath -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $svc.IsHealthy = $true
                Write-Step "✅" "$($svc.Name) is READY on port $($svc.Port)"
            } else {
                $allHealthy = $false
            }
        } catch {
            $allHealthy = $false
        }
    }
    
    if ($allHealthy) { break }
    Start-Sleep -Seconds 2
}

$stopwatch.Stop()

if (-not $allHealthy) {
    Write-ErrorMsg "Timeout reached! Not all services started correctly."
    foreach ($svc in $runningServices) {
        if (-not $svc.IsHealthy) {
            Write-ErrorMsg "$($svc.Name) is still not responding on $($svc.HealthPath)."
            Write-ErrorMsg "Check log: $($svc.LogFile)"
        }
    }
    Write-Host "Shutting down gracefully..." -ForegroundColor Yellow
    & ".\stop.ps1"
    exit 1
}

Write-Header "EduSphere is Running!"

# ── Detect LAN IP for network access ──────────────────────────────────
# Prefer real routable IPs: 192.168.x.x, 10.x.x.x, 172.16-31.x.x
# Skip loopback (127.x), link-local/APIPA (169.254.x), virtual adapters
$lanIP = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
        $_.InterfaceAlias -notmatch 'Loopback|vEthernet|WSL|Hyper|VirtualBox|VMware|Bluetooth' -and
        $_.IPAddress -match '^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)'
    } |
    Sort-Object -Property PrefixLength -Descending |
    Select-Object -First 1).IPAddress

if (-not $lanIP) {
    # Fallback: any non-loopback, non-APIPA address
    $lanIP = (Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' } |
        Select-Object -First 1).IPAddress
}
if (-not $lanIP) { $lanIP = "127.0.0.1" }

Write-Step "🔍" "Running current-user verification & generating test accounts..."

$nodeProc = Start-Process -FilePath "node" -ArgumentList "backend/scripts/verify-startup.js", $lanIP -Wait -PassThru -NoNewWindow
if ($nodeProc.ExitCode -ne 0) {
    Write-ErrorMsg "Startup Verification Failed (Exit Code: $($nodeProc.ExitCode)). Halting."
    Write-Host "Shutting down gracefully..." -ForegroundColor Yellow
    & ".\stop.ps1"
    exit 1
}

# Open browser ONLY after frontend is fully verified
try {
    Start-Process "http://${lanIP}:5173"
    Write-Step "🌍" "Opening browser... (Local: http://127.0.0.1:5173 | Network: http://${lanIP}:5173)"
} catch {
    Write-Host "  Please open http://${lanIP}:5173 manually" -ForegroundColor Yellow
}

Write-Host "`n  Press Ctrl+C to stop all services`n" -ForegroundColor DarkGray


# Handle Ctrl+C (SIGINT) gracefully without closing terminal
try { [console]::TreatControlCAsInput = $true } catch {}
while ($true) {
    try {
        if ([console]::KeyAvailable) {
            $key = [console]::ReadKey($true)
            if ($key.Key -eq 'C' -and $key.Modifiers -match 'Control') {
                break
            }
        }
    } catch {
        # If no console is attached, just sleep and wait to be killed
    }
    Start-Sleep -Milliseconds 200
}

Write-Host "`nCtrl+C detected! Shutting down gracefully..." -ForegroundColor Yellow
& ".\stop.ps1"
