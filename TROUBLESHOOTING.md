# Node.js 설치 및 프로젝트 실행 가이드

## 문제 상황
Node.js가 설치되었지만 PATH에 등록되지 않아 명령어를 인식하지 못하고 있습니다.

## 해결 방법

### 방법 1: Node.js 재설치 (권장)

1. **기존 Node.js 제거**
   - Windows 설정 > 앱 > Node.js 검색 > 제거

2. **새로 설치**
   - 다운로드 링크: https://nodejs.org/dist/v20.18.1/node-v20.18.1-x64.msi
   - 설치 중 **"Add to PATH"** 옵션 반드시 체크
   - 설치 완료 후 **컴퓨터 재시작**

3. **확인**
   ```powershell
   node --version
   npm --version
   ```

### 방법 2: 수동으로 PATH 추가

1. **Node.js 설치 경로 찾기**
   - 일반적으로: `C:\Program Files\nodejs\`

2. **환경 변수 설정**
   - Windows 검색 > "환경 변수" 입력
   - "시스템 환경 변수 편집" 클릭
   - "환경 변수" 버튼 클릭
   - "시스템 변수"에서 "Path" 선택 > "편집"
   - "새로 만들기" 클릭
   - `C:\Program Files\nodejs\` 입력
   - 확인 > 확인 > 확인

3. **VS Code 재시작**

4. **확인**
   ```powershell
   node --version
   npm --version
   ```

### 방법 3: 전체 경로로 실행 (임시 방법)

Node.js가 설치되어 있다면 전체 경로로 실행할 수 있습니다:

```powershell
# Node.js 경로 확인
dir "C:\Program Files\nodejs\node.exe"

# 전체 경로로 실행
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" start
```

## 프로젝트 실행

Node.js가 정상적으로 인식되면:

### 백엔드 실행
```powershell
cd C:\Users\USER\Desktop\앱개발\server
npm install
npm start
```

### 프론트엔드 실행 (새 터미널)
```powershell
cd C:\Users\USER\Desktop\앱개발\client
npm install
npm run dev
```

## 환경 설정 완료 상태

✅ API 키 설정 완료: `server/.env`
✅ 암호화 키 생성 완료
✅ JWT 비밀키 생성 완료
✅ 프로젝트 구조 완료

## MongoDB 설정 (선택)

현재는 로컬 MongoDB를 사용하도록 설정되어 있습니다.
MongoDB가 없어도 프론트엔드는 작동하지만, 데이터 저장은 불가능합니다.

### MongoDB Atlas (무료 클라우드) 사용
1. https://www.mongodb.com/cloud/atlas 접속
2. 무료 계정 생성
3. 클러스터 생성
4. "Connect" > "Connect your application" 선택
5. 연결 문자열 복사
6. `server/.env` 파일의 `MONGODB_URI` 수정

## 문제 해결

### "node를 찾을 수 없습니다" 오류
→ Node.js를 재설치하거나 PATH를 수동으로 추가하세요

### "npm을 찾을 수 없습니다" 오류
→ Node.js 설치 시 npm이 함께 설치됩니다. Node.js를 재설치하세요

### 포트 충돌 오류
→ `server/.env`에서 PORT를 3001로 변경하세요

### MongoDB 연결 오류
→ MongoDB가 실행 중인지 확인하거나 MongoDB Atlas를 사용하세요
