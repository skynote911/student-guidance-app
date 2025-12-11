# MongoDB 설정 가이드

## 🚀 빠른 시작: MongoDB Atlas 사용 (권장)

MongoDB Atlas는 무료 클라우드 MongoDB 서비스입니다. 설치 없이 바로 사용할 수 있습니다.

### 1단계: MongoDB Atlas 계정 생성

1. https://www.mongodb.com/cloud/atlas 접속
2. "Try Free" 버튼 클릭
3. 이메일로 계정 생성

### 2단계: 클러스터 생성

1. "Build a Database" 클릭
2. **Free (M0)** 플랜 선택
3. 클라우드 제공자 및 지역 선택 (가장 가까운 지역 권장)
4. 클러스터 이름 입력 (예: "student-guidance")
5. "Create" 클릭

### 3단계: 데이터베이스 사용자 생성

1. "Database Access" 메뉴 클릭
2. "Add New Database User" 클릭
3. 사용자명과 비밀번호 설정 (기억해두세요!)
4. "Database User Privileges"는 "Read and write to any database" 선택
5. "Add User" 클릭

### 4단계: 네트워크 접근 설정

1. "Network Access" 메뉴 클릭
2. "Add IP Address" 클릭
3. "Add Current IP Address" 클릭 (또는 "Allow Access from Anywhere" 선택 - 개발용)
4. "Confirm" 클릭

### 5단계: 연결 문자열 복사

1. "Database" 메뉴로 돌아가기
2. "Connect" 버튼 클릭
3. "Connect your application" 선택
4. 연결 문자열 복사 (예: `mongodb+srv://username:password@cluster.mongodb.net/...`)

### 6단계: .env 파일에 연결 문자열 설정

`server/.env` 파일을 열고 다음을 수정:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-guidance?retryWrites=true&w=majority
```

**중요**: `username`과 `password`를 3단계에서 만든 실제 사용자명과 비밀번호로 변경하세요!

---

## 💻 로컬 MongoDB 설치 (선택사항)

로컬에서 MongoDB를 설치하고 실행하려면:

### Windows 설치

1. https://www.mongodb.com/try/download/community 다운로드
2. 설치 프로그램 실행
3. "Complete" 설치 선택
4. "Install MongoDB as a Service" 체크
5. 설치 완료

### 로컬 MongoDB 실행

```powershell
# MongoDB 서비스 시작
net start MongoDB

# 또는 직접 실행
mongod
```

### .env 파일 설정

```env
MONGODB_URI=mongodb://localhost:27017/student-guidance
```

---

## ✅ 연결 테스트

설정 완료 후:

```powershell
cd server
node create-master-account.js
```

성공하면 마스터 계정이 생성됩니다!

---

## 🔧 문제 해결

### 연결 오류가 발생하면:

1. **MongoDB Atlas**: 
   - IP 주소가 허용되었는지 확인
   - 사용자명/비밀번호가 올바른지 확인
   - 연결 문자열에 실제 비밀번호가 들어갔는지 확인

2. **로컬 MongoDB**:
   - MongoDB 서비스가 실행 중인지 확인: `Get-Service MongoDB`
   - 포트 27017이 사용 중인지 확인: `netstat -ano | findstr :27017`


