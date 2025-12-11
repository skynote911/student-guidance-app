# Student Guidance Backend Server

학생 생활지도 도우미 백엔드 서버입니다.

## 기능

- ✅ 교사 계정 등록 및 로그인 (JWT 인증)
- ✅ 비밀번호 해시 처리 (bcrypt)
- ✅ 학생 사안 분석 (Gemini AI)
- ✅ 민감 정보 암호화 (AES-256-CBC)
- ✅ MongoDB 데이터베이스 연동
- ✅ 교사별 접근 제어

## 설치 방법

### 1. Node.js 설치

Node.js 18 이상이 필요합니다. [Node.js 공식 사이트](https://nodejs.org/)에서 다운로드하세요.

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 값을 설정하세요:

```bash
cp .env.example .env
```

#### 필수 환경 변수:

- `GEMINI_API_KEY`: Google Gemini API 키
- `MONGODB_URI`: MongoDB 연결 문자열
- `ENCRYPTION_KEY`: 32바이트 암호화 키 (hex)
- `JWT_SECRET`: JWT 서명용 비밀 키

#### 암호화 키 생성:

```bash
# ENCRYPTION_KEY 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_SECRET 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. MongoDB 설치 및 실행

#### 로컬 MongoDB:
- [MongoDB Community Edition](https://www.mongodb.com/try/download/community) 다운로드
- 설치 후 실행: `mongod`

#### 또는 MongoDB Atlas (클라우드):
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 무료 계정 생성
- 클러스터 생성 후 연결 문자열 복사

## 실행 방법

### 개발 모드 (자동 재시작):
```bash
npm run dev
```

### 프로덕션 모드:
```bash
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 인증 (Authentication)

#### 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "teacher@school.com",
  "password": "password123",
  "name": "김선생"
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@school.com",
  "password": "password123"
}
```

응답:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "teacher": {
    "_id": "...",
    "email": "teacher@school.com",
    "name": "김선생",
    "role": "teacher"
  }
}
```

#### 내 정보 조회
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 분석 (Analysis)

#### 학생 행동 분석
```http
POST /api/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "철수가 점심시간에 급식실에서 영희를 밀쳤어",
  "studentId": "2024001",
  "saveToDb": true
}
```

응답:
```json
{
  "success": true,
  "analysis": {
    "who": "철수(가해), 영희(피해)",
    "when": "2024년 11월 27일 점심시간",
    "where": "급식실",
    "what": "밀침",
    "how": "고의적으로",
    "why": "미확인",
    "incidentType": "또래 갈등",
    "guidance": "...",
    "neis": "..."
  },
  "incidentId": "...",
  "saved": true
}
```

#### 내 사안 기록 조회
```http
GET /api/analyze/incidents
Authorization: Bearer <token>
```

#### 특정 사안 조회
```http
GET /api/analyze/incidents/:id
Authorization: Bearer <token>
```

## 보안 기능

### 1. 비밀번호 해시
- bcrypt 알고리즘 사용 (salt rounds: 10)
- 비밀번호는 절대 평문으로 저장되지 않음

### 2. JWT 인증
- 로그인 시 JWT 토큰 발급
- 토큰 유효기간: 24시간
- 모든 보호된 라우트는 토큰 검증 필요

### 3. 필드 레벨 암호화
- `rawData` (원본 텍스트): AES-256-CBC 암호화
- `teacherNote` (교사 메모): AES-256-CBC 암호화
- 데이터베이스에는 암호화된 상태로 저장
- 조회 시에만 복호화

### 4. 접근 제어
- 교사는 본인이 작성한 기록만 조회 가능
- `teacherId` 필드로 소유권 확인

## 데이터베이스 스키마

### Teacher (교사)
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (default: 'teacher'),
  createdAt: Date
}
```

### Incident (사안)
```javascript
{
  studentId: String,
  incidentDate: Date,
  incidentType: String,
  rawData: String (encrypted),
  aiAnalysis: Object,
  teacherNote: String (encrypted),
  teacherId: ObjectId (ref: Teacher),
  isEncrypted: Boolean,
  timestamps: true
}
```

## 문제 해결

### MongoDB 연결 오류
- MongoDB가 실행 중인지 확인
- `MONGODB_URI`가 올바른지 확인
- 방화벽 설정 확인

### Gemini API 오류
- `GEMINI_API_KEY`가 올바른지 확인
- API 할당량 확인
- 네트워크 연결 확인

### 암호화 오류
- `ENCRYPTION_KEY`가 64자리 hex 문자열인지 확인 (32바이트)
- 키 생성 명령어로 새 키 생성

## 라이선스

ISC
