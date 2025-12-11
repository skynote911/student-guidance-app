# Student Guidance Frontend

학생 생활지도 도우미 프론트엔드 (React + Vite)

## 기능

- ✅ 교사 로그인/회원가입
- ✅ JWT 토큰 기반 인증
- ✅ 학생 사안 입력 (텍스트/음성)
- ✅ 사건 유형 선택
- ✅ 비언어적 태도 체크박스
- ✅ AI 분석 결과 표시
- ✅ NEIS 문구 복사
- ✅ 반응형 디자인

## 설치 방법

### 1. Node.js 설치
Node.js 18 이상이 필요합니다. [Node.js 공식 사이트](https://nodejs.org/)에서 다운로드하세요.

### 2. 의존성 설치
```bash
npm install
```

## 실행 방법

### 개발 모드
```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

### 프로덕션 빌드
```bash
npm run build
npm run preview
```

## 프로젝트 구조

```
client/
├── index.html              # HTML 진입점
├── vite.config.js          # Vite 설정
├── package.json            # 의존성
├── src/
│   ├── main.jsx            # React 진입점
│   ├── App.jsx             # 메인 앱 컴포넌트
│   ├── context/
│   │   └── AuthContext.jsx # 인증 컨텍스트
│   ├── services/
│   │   └── api.js          # API 서비스
│   ├── components/
│   │   ├── PrivateRoute.jsx # 보호된 라우트
│   │   ├── InputArea.jsx    # 입력 폼
│   │   └── ResultCard.jsx   # 결과 카드
│   ├── pages/
│   │   ├── Login.jsx        # 로그인 페이지
│   │   ├── Register.jsx     # 회원가입 페이지
│   │   └── Dashboard.jsx    # 대시보드
│   └── styles/
│       ├── App.css          # 전역 스타일
│       ├── Auth.css         # 인증 페이지 스타일
│       └── Dashboard.css    # 대시보드 스타일
```

## 주요 컴포넌트

### AuthContext
- 사용자 인증 상태 관리
- 로그인/로그아웃 기능
- JWT 토큰 localStorage 저장

### InputArea
- 사건 유형 드롭다운
- 텍스트 입력창
- 음성 입력 (Web Speech API)
- 비언어적 태도 체크박스
- 학생 ID 입력

### ResultCard
- 5W1H 분석 결과 표시
- 생활지도 가이드
- NEIS 입력용 문구
- 복사 버튼

## API 연동

백엔드 서버가 `http://localhost:3000`에서 실행 중이어야 합니다.

Vite 프록시 설정으로 `/api` 요청이 자동으로 백엔드로 전달됩니다.

## 환경 요구사항

- Node.js 18+
- 백엔드 서버 실행 중
- 모던 브라우저 (Chrome, Firefox, Safari, Edge)

## 브라우저 지원

- Chrome/Edge (최신)
- Firefox (최신)
- Safari (최신)
- 음성 입력은 Chrome/Edge에서만 지원

## 라이선스

ISC
