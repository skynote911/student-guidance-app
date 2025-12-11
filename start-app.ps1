# 생활지도 도우미 앱 자동 실행 스크립트

Write-Host "🚀 생활지도 도우미 앱 시작 중..." -ForegroundColor Green
Write-Host ""

# 서버 디렉토리로 이동
$serverPath = Join-Path $PSScriptRoot "server"
$clientPath = Join-Path $PSScriptRoot "client"

# 서버 실행 (새 PowerShell 창)
Write-Host "📦 백엔드 서버 시작 중..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; Write-Host '🚀 백엔드 서버 실행 중...' -ForegroundColor Green; npm start" -WindowStyle Normal

# 3초 대기 (서버가 시작될 시간)
Start-Sleep -Seconds 3

# 클라이언트 실행 (새 PowerShell 창)
Write-Host "🎨 프론트엔드 클라이언트 시작 중..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; Write-Host '🎨 프론트엔드 클라이언트 실행 중...' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ 앱이 시작되었습니다!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 실행 정보:" -ForegroundColor Cyan
Write-Host "   - 백엔드 서버: http://localhost:3000" -ForegroundColor White
Write-Host "   - 프론트엔드: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "🌐 브라우저에서 http://localhost:5173 을 열어주세요!" -ForegroundColor Magenta
Write-Host ""
Write-Host "⚠️  종료하려면 각 PowerShell 창을 닫으세요." -ForegroundColor Yellow


