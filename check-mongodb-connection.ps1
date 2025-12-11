# MongoDB 연결 확인 스크립트

Write-Host "=== MongoDB 연결 확인 ===" -ForegroundColor Cyan
Write-Host ""

# 서버 상태 확인
Write-Host "1. 서버 상태 확인 중..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get -TimeoutSec 3
    Write-Host "   ✅ 서버 실행 중" -ForegroundColor Green
    Write-Host "   MongoDB 상태: $($health.mongodb)" -ForegroundColor $(if ($health.mongodb -eq 'connected') { 'Green' } else { 'Yellow' })
    
    if ($health.mongodb -eq 'connected') {
        Write-Host ""
        Write-Host "🎉 MongoDB 연결 성공!" -ForegroundColor Green
        Write-Host ""
        Write-Host "로그인 테스트 진행..." -ForegroundColor Yellow
        
        $loginBody = @{
            email = "master@school.com"
            password = "master123!"
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 5
            Write-Host "✅ 로그인 성공!" -ForegroundColor Green
            Write-Host "   교사: $($loginResponse.teacher.name)" -ForegroundColor Cyan
            Write-Host "   이메일: $($loginResponse.teacher.email)" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "🎉 모든 설정이 완료되었습니다!" -ForegroundColor Green
            Write-Host "   브라우저에서 http://localhost:5173 을 열어 로그인하세요." -ForegroundColor Cyan
        } catch {
            Write-Host "❌ 로그인 실패" -ForegroundColor Red
            if ($_.ErrorDetails) {
                $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($errorObj) {
                    Write-Host "   오류: $($errorObj.message)" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host ""
        Write-Host "❌ MongoDB가 연결되지 않았습니다." -ForegroundColor Red
        Write-Host ""
        Write-Host "MongoDB Atlas에서 IP 화이트리스트를 설정했는지 확인하세요:" -ForegroundColor Yellow
        Write-Host "1. https://cloud.mongodb.com/ 접속" -ForegroundColor White
        Write-Host "2. Network Access > Add IP Address" -ForegroundColor White
        Write-Host "3. 'Add Current IP Address' 또는 '0.0.0.0/0' (모든 IP)" -ForegroundColor White
        Write-Host ""
        Write-Host "설정 후 서버를 재시작하세요." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 서버에 연결할 수 없습니다." -ForegroundColor Red
    Write-Host "   서버가 실행 중인지 확인하세요." -ForegroundColor Yellow
}

Write-Host ""

