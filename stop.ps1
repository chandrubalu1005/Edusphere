#!/usr/bin/env pwsh
# =============================================================
# EduSphere Enterprise — Graceful Shutdown Script
# Usage: .\stop.ps1
# =============================================================

Write-Host "`n══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  EduSphere Enterprise — Shutting Down" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════`n" -ForegroundColor Cyan

# Define all ports used by EduSphere
$ports = @(5173, 5174) + (3001..3015)

$killedCount = 0

# 1. Kill tracked root processes (npm.cmd wrappers)
$pidFile = ".\logs\.edusphere.pids"
if (Test-Path $pidFile) {
    $pids = Get-Content $pidFile
    foreach ($p in $pids) {
        if ($p -and $p -match "^\d+$") {
            try {
                $processName = (Get-Process -Id $p -ErrorAction SilentlyContinue).ProcessName
                if ($processName) {
                    Write-Host "🛑 Killing tracked root process tree $processName (PID: $p)..." -ForegroundColor Yellow
                    & taskkill /F /T /PID $p 2>&1 | Out-Null
                    $killedCount++
                }
            } catch {}
        }
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

# 2. Fallback: Kill any remaining orphaned listeners on EduSphere ports

foreach ($port in $ports) {
    # Find process listening on the port
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    
    foreach ($conn in $connections) {
        $pidToKill = $conn.OwningProcess
        if ($pidToKill -and $pidToKill -ne 0) {
            try {
                $processName = (Get-Process -Id $pidToKill -ErrorAction SilentlyContinue).ProcessName
                Write-Host "🛑 Killing process $processName (PID: $pidToKill) listening on port $port..." -ForegroundColor Yellow
                # Kill the process tree forcefully
                & taskkill /F /T /PID $pidToKill 2>&1 | Out-Null
                $killedCount++
            } catch {
                Write-Host "⚠️ Failed to kill PID $pidToKill on port $port" -ForegroundColor Red
            }
        }
    }
}

if ($killedCount -eq 0) {
    Write-Host "✅ No orphaned EduSphere processes found running." -ForegroundColor Green
} else {
    Write-Host "✅ Successfully terminated $killedCount process(es)." -ForegroundColor Green
}

Write-Host "`nShutdown complete.`n" -ForegroundColor Cyan
