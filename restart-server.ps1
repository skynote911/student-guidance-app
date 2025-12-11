# 서버 재시작 스크립트

Write-Host "🔄 서버 재시작 중..." -ForegroundColor Yellow
Write-Host ""

# Node.js 프로세스 종료 (포트 3000 사용 중인 프로세스)
Write-Host "기존 서버 프로세스 종료 중..." -ForegroundColor Cyan
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($processId in $processes) {
    try {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Host "   프로세스 $processId 종료됨" -ForegroundColor Green
    }
    catch {
        Write-Host "   프로세스 $processId 종료 실패" -ForegroundColor Yellow
    }
}

Start-Sleep -Seconds 2

# 서버 디렉토리로 이동
$serverPath = Join-Path $PSScriptRoot "server"

# 서버 실행 (새 PowerShell 창)
Write-Host "📦 백엔드 서버 시작 중..." -ForegroundColor Yellow

$startCommand = "Set-Location -LiteralPath '$serverPath'; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$startCommand" -WindowStyle Normal

Write-Host ""
Write-Host "✅ 서버가 재시작되었습니다!" -ForegroundColor Green
Write-Host "   잠시 후 http://localhost:3000/health 에서 상태를 확인하세요." -ForegroundColor Cyan
Write-Host ""

