# 프로젝트 실행 가이드

## 1단계: PowerShell 재시작

Node.js를 설치한 후에는 **PowerShell을 완전히 닫고 다시 열어야** PATH가 업데이트됩니다.

1. 현재 PowerShell 창을 모두 닫습니다
2. 새로운 PowerShell 창을 엽니다
3. 아래 명령어로 확인:
   ```powershell
   node --version
   npm --version
   ```

## 2단계: 환경 변수 설정

`server/.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Gemini API 키
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB 연결 문자열
MONGODB_URI=mongodb://localhost:27017/student-guidance

# 암호화 키 (32바이트 hex)
ENCRYPTION_KEY=

# JWT 비밀키 (64바이트 hex)
JWT_SECRET=

# 서버 포트
PORT=3000
```

### 암호화 키 생성

PowerShell에서 다음 명령어를 실행하여 키를 생성하세요:

```powershell
# ENCRYPTION_KEY 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_SECRET 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

생성된 키를 `.env` 파일에 복사하세요.

## 3단계: MongoDB 설치 및 실행

### 옵션 A: MongoDB 로컬 설치
1. https://www.mongodb.com/try/download/community 에서 다운로드
2. 설치 후 실행:
   ```powershell
   mongod
   ```

### 옵션 B: MongoDB Atlas (클라우드)
1. https://www.mongodb.com/cloud/atlas 에서 무료 계정 생성
2. 클러스터 생성 후 연결 문자열 복사
3. `.env` 파일의 `MONGODB_URI`에 붙여넣기

## 4단계: 백엔드 실행

```powershell
cd server
npm install
npm start
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 5단계: 프론트엔드 실행 (새 터미널)

```powershell
cd client
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

## 문제 해결

### "node를 찾을 수 없습니다" 오류
- PowerShell을 재시작하세요
- 또는 컴퓨터를 재시작하세요

### MongoDB 연결 오류
- MongoDB가 실행 중인지 확인하세요
- `.env` 파일의 `MONGODB_URI`가 올바른지 확인하세요

### 포트 충돌
- 다른 프로그램이 3000번 또는 5173번 포트를 사용 중일 수 있습니다
- `.env`에서 `PORT`를 변경하거나 해당 프로그램을 종료하세요

## 패턴 분석 기능 테스트

1. 회원가입 후 로그인
2. 학생 ID 입력 (예: "2024001")
3. 사건 유형 선택 (예: "수업 방해")
4. 사건 내용 입력
5. "AI 분석 시작" 클릭
6. 같은 학생 ID로 여러 건 입력
7. 패턴 분석 결과 확인 (예: "수학 시간에 3회 반복됨")
