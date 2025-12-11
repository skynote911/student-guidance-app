$clientPath = "$PSScriptRoot\client"
Write-Host "🚀 프론트엔드 서버 시작 중..." -ForegroundColor Yellow
$startCommand = "Set-Location -LiteralPath '$clientPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$startCommand" -WindowStyle Normal
