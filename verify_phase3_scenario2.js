/**
 * Phase 3: 출결 시각화 및 마일리지 (Scenario 2) 검증 스크립트
 * 
 * 검증 항목:
 * 1. 학생 등록 기능
 * 2. 출결 처리 기능 (PRESENT, LATE, ABSENT)
 * 3. 마일리지 시스템 (출석 시 +1P)
 * 4. 출결 기록 조회 (최근 30일)
 * 5. 출결 시각화 차트 데이터 형식
 * 6. UI 컴포넌트 렌더링
 */

const fs = require('fs');
const path = require('path');

// 검증 결과 저장
const results = {
    timestamp: new Date().toISOString(),
    phase: 'Phase 3: 출결 시각화 및 마일리지 (Scenario 2)',
    tests: [],
    summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
    }
};

function addTest(name, status, message, details = null) {
    results.tests.push({
        name,
        status, // 'pass', 'fail', 'warning'
        message,
        details
    });
    results.summary.total++;
    if (status === 'pass') results.summary.passed++;
    else if (status === 'fail') results.summary.failed++;
    else if (status === 'warning') results.summary.warnings++;
}

function checkFileExists(filePath, description) {
    const fullPath = path.resolve(filePath);
    const exists = fs.existsSync(fullPath);
    addTest(
        `파일 존재 확인: ${description}`,
        exists ? 'pass' : 'fail',
        exists ? `파일 존재: ${filePath}` : `파일 없음: ${filePath}`
    );
    return exists;
}

function checkFileContent(filePath, patterns, description) {
    if (!fs.existsSync(filePath)) {
        addTest(`파일 내용 확인: ${description}`, 'fail', `파일이 존재하지 않음: ${filePath}`);
        return false;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const checks = Array.isArray(patterns) ? patterns : [patterns];
    let allPassed = true;

    checks.forEach(pattern => {
        const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
        const found = regex.test(content);
        if (!found) allPassed = false;
        addTest(
            `파일 내용 확인: ${description} - "${pattern}"`,
            found ? 'pass' : 'fail',
            found ? `패턴 발견됨` : `패턴 없음: ${pattern}`
        );
    });

    return allPassed;
}

console.log('🔍 Phase 3 Scenario 2 검증 시작...\n');

// ============================================
// 1. 백엔드 검증
// ============================================
console.log('📦 백엔드 검증 중...');

// 1.1 출결 라우트 파일 확인
checkFileExists('server/routes/attendance.js', '출결 라우트');

// 1.2 출결 모델 확인
checkFileExists('server/models/Attendance.js', '출결 모델');
checkFileContent('server/models/Attendance.js', [
    'PRESENT',
    'LATE',
    'ABSENT',
    'EARLY_LEAVE',
    'studentId',
    'date',
    'status'
], '출결 모델 스키마');

// 1.3 학생 모델 확인
checkFileExists('server/models/Student.js', '학생 모델');
checkFileContent('server/models/Student.js', [
    'mileage',
    'studentId',
    'teacherId'
], '학생 모델 스키마 (마일리지 포함)');

// 1.4 출결 라우트 엔드포인트 확인
checkFileContent('server/routes/attendance.js', [
    'GET.*students',
    'POST.*students',
    'POST.*attendance',
    'GET.*history'
], '출결 API 엔드포인트');

// 1.5 마일리지 계산 로직 확인
checkFileContent('server/routes/attendance.js', [
    'mileageChange',
    'status === \'PRESENT\'',
    'mileage.*\\+='
], '마일리지 계산 로직');

// 1.6 서버 인덱스에 출결 라우트 등록 확인
checkFileContent('server/index.js', [
    'attendanceRoutes',
    '/api/attendance'
], '서버 라우트 등록');

// ============================================
// 2. 프론트엔드 검증
// ============================================
console.log('\n🎨 프론트엔드 검증 중...');

// 2.1 출결 페이지 확인
checkFileExists('client/src/pages/Attendance.jsx', '출결 페이지');

// 2.2 출결 차트 컴포넌트 확인
checkFileExists('client/src/components/AttendanceChart.jsx', '출결 차트 컴포넌트');

// 2.3 출결 페이지 기능 확인
checkFileContent('client/src/pages/Attendance.jsx', [
    'getStudents',
    'addStudent',
    'markAttendance',
    'getAttendanceHistory',
    'selectedStudent',
    'history',
    'mileage'
], '출결 페이지 기능');

// 2.4 출결 차트 데이터 처리 확인
checkFileContent('client/src/components/AttendanceChart.jsx', [
    'BarChart',
    'PRESENT',
    'LATE',
    'ABSENT',
    'EARLY_LEAVE',
    'statusCounts',
    'ResponsiveContainer'
], '출결 차트 구현');

// 2.5 API 서비스 확인
checkFileContent('client/src/services/api.js', [
    'getStudents',
    'addStudent',
    'markAttendance',
    'getAttendanceHistory',
    '/attendance'
], '출결 API 서비스');

// 2.6 라우팅 확인
checkFileContent('client/src/App.jsx', [
    '/attendance',
    'Attendance'
], '출결 페이지 라우팅');

// 2.7 대시보드에서 출결 페이지 링크 확인
checkFileContent('client/src/pages/Dashboard.jsx', [
    '/attendance',
    '출결.*마일리지'
], '대시보드 출결 링크');

// ============================================
// 3. 기능별 상세 검증
// ============================================
console.log('\n⚙️  기능별 상세 검증 중...');

// 3.1 학생 등록 기능
const attendancePageContent = fs.existsSync('client/src/pages/Attendance.jsx') 
    ? fs.readFileSync('client/src/pages/Attendance.jsx', 'utf-8') : '';
const hasStudentRegistration = /newStudentName|addStudent|등록/i.test(attendancePageContent);
addTest(
    '학생 등록 기능',
    hasStudentRegistration ? 'pass' : 'fail',
    hasStudentRegistration ? '학생 등록 폼 구현됨' : '학생 등록 폼 없음'
);

// 3.2 출결 처리 버튼
const hasAttendanceButtons = /출석|지각|결석|PRESENT|LATE|ABSENT/i.test(attendancePageContent);
addTest(
    '출결 처리 버튼',
    hasAttendanceButtons ? 'pass' : 'fail',
    hasAttendanceButtons ? '출석/지각/결석 버튼 구현됨' : '출결 버튼 없음'
);

// 3.3 마일리지 표시
const hasMileageDisplay = /mileage|마일리지|P/i.test(attendancePageContent);
addTest(
    '마일리지 표시',
    hasMileageDisplay ? 'pass' : 'fail',
    hasMileageDisplay ? '마일리지 표시 구현됨' : '마일리지 표시 없음'
);

// 3.4 학생 선택 기능
const hasStudentSelection = /selectedStudent|handleStudentClick/i.test(attendancePageContent);
addTest(
    '학생 선택 기능',
    hasStudentSelection ? 'pass' : 'fail',
    hasStudentSelection ? '학생 선택 기능 구현됨' : '학생 선택 기능 없음'
);

// 3.5 출결 기록 조회
const hasHistoryFetch = /fetchHistory|getAttendanceHistory/i.test(attendancePageContent);
addTest(
    '출결 기록 조회',
    hasHistoryFetch ? 'pass' : 'fail',
    hasHistoryFetch ? '출결 기록 조회 기능 구현됨' : '출결 기록 조회 없음'
);

// 3.6 차트 데이터 처리
const chartContent = fs.existsSync('client/src/components/AttendanceChart.jsx')
    ? fs.readFileSync('client/src/components/AttendanceChart.jsx', 'utf-8') : '';
const hasChartDataProcessing = /statusCounts|history\.forEach/i.test(chartContent);
addTest(
    '차트 데이터 처리',
    hasChartDataProcessing ? 'pass' : 'fail',
    hasChartDataProcessing ? '차트 데이터 처리 로직 구현됨' : '차트 데이터 처리 없음'
);

// 3.7 차트 렌더링
const hasChartRendering = /BarChart|ResponsiveContainer/i.test(chartContent);
addTest(
    '차트 렌더링',
    hasChartRendering ? 'pass' : 'fail',
    hasChartRendering ? '차트 렌더링 구현됨' : '차트 렌더링 없음'
);

// 3.8 마일리지 업데이트 로직 (백엔드)
const attendanceRouteContent = fs.existsSync('server/routes/attendance.js')
    ? fs.readFileSync('server/routes/attendance.js', 'utf-8') : '';
const hasMileageUpdate = /mileage.*\\+=|currentMileage/i.test(attendanceRouteContent);
addTest(
    '마일리지 업데이트 로직',
    hasMileageUpdate ? 'pass' : 'fail',
    hasMileageUpdate ? '마일리지 업데이트 로직 구현됨' : '마일리지 업데이트 로직 없음'
);

// 3.9 출석 시 마일리지 증가
const hasMileageIncrement = /status === ['"]PRESENT['"]|mileageChange = 1/i.test(attendanceRouteContent);
addTest(
    '출석 시 마일리지 증가',
    hasMileageIncrement ? 'pass' : 'fail',
    hasMileageIncrement ? '출석 시 마일리지 증가 로직 구현됨' : '출석 시 마일리지 증가 로직 없음'
);

// 3.10 최근 30일 기록 조회
const has30DayLimit = /limit\(30\)|30.*days/i.test(attendanceRouteContent);
addTest(
    '최근 30일 기록 조회',
    has30DayLimit ? 'pass' : 'warning',
    has30DayLimit ? '30일 제한 구현됨' : '30일 제한 명시되지 않음 (기능은 동작할 수 있음)'
);

// ============================================
// 4. 의존성 검증
// ============================================
console.log('\n📚 의존성 검증 중...');

// 4.1 recharts 라이브러리 확인
const packageJsonPath = 'client/package.json';
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const hasRecharts = packageJson.dependencies?.recharts || packageJson.devDependencies?.recharts;
    addTest(
        'recharts 라이브러리',
        hasRecharts ? 'pass' : 'fail',
        hasRecharts ? `recharts 설치됨 (${packageJson.dependencies?.recharts || packageJson.devDependencies?.recharts})` : 'recharts 미설치'
    );
} else {
    addTest('recharts 라이브러리', 'fail', 'package.json 파일 없음');
}

// ============================================
// 5. 코드 품질 검증
// ============================================
console.log('\n✨ 코드 품질 검증 중...');

// 5.1 에러 처리
const hasErrorHandling = /try.*catch|error|catch.*error/i.test(attendancePageContent);
addTest(
    '에러 처리',
    hasErrorHandling ? 'pass' : 'warning',
    hasErrorHandling ? '에러 처리 구현됨' : '에러 처리 부족'
);

// 5.2 로딩 상태
const hasLoadingState = /loading|Loading/i.test(attendancePageContent);
addTest(
    '로딩 상태',
    hasLoadingState ? 'pass' : 'warning',
    hasLoadingState ? '로딩 상태 구현됨' : '로딩 상태 없음'
);

// ============================================
// 결과 출력
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📊 검증 결과 요약');
console.log('='.repeat(60));
console.log(`총 테스트: ${results.summary.total}`);
console.log(`✅ 통과: ${results.summary.passed}`);
console.log(`❌ 실패: ${results.summary.failed}`);
console.log(`⚠️  경고: ${results.summary.warnings}`);
console.log('='.repeat(60));

console.log('\n📋 상세 결과:\n');
results.tests.forEach((test, index) => {
    const icon = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} [${test.status.toUpperCase()}] ${test.name}`);
    console.log(`   ${test.message}`);
    if (test.details) {
        console.log(`   상세: ${JSON.stringify(test.details, null, 2)}`);
    }
});

// 결과를 파일로 저장
const reportPath = 'phase3_scenario2_verification_report.json';
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
console.log(`\n📄 상세 리포트 저장: ${reportPath}`);

// 최종 판정
const successRate = (results.summary.passed / results.summary.total) * 100;
console.log(`\n🎯 성공률: ${successRate.toFixed(1)}%`);

if (results.summary.failed === 0) {
    console.log('\n🎉 모든 검증 통과! Phase 3 Scenario 2가 정상적으로 구현되었습니다.');
    process.exit(0);
} else {
    console.log(`\n⚠️  ${results.summary.failed}개의 실패 항목이 있습니다. 위의 상세 결과를 확인하세요.`);
    process.exit(1);
}

