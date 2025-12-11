
$port = 3000
Write-Host "Checking for process on port $port..."

$tcpConnection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($tcpConnection) {
    $pidsToCheck = $tcpConnection | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pIdVal in $pidsToCheck) {
        Write-Host "Killing process ID: $pIdVal"
        Stop-Process -Id $pIdVal -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "No process found on port $port."
}

Start-Sleep -Seconds 2

$serverPath = Join-Path $PSScriptRoot "server"
Write-Host "Starting server from $serverPath"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; npm start" -WindowStyle Normal

Write-Host "Done."
