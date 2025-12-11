import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { analysisAPI } from '../services/api';
import '../styles/Dashboard.css'; // Reuse dashboard styles for consistency

const Attendance = () => {
    const navigate = useNavigate();
    const { teacher } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentId, setNewStudentId] = useState('');

    const [selectedTeacher, setSelectedTeacher] = useState('all'); // Admin filter state
    const [teacherSearchTerm, setTeacherSearchTerm] = useState(''); // Teacher filter search
    const [selectedStudents, setSelectedStudents] = useState(new Set()); // Bulk delete selection
    const [searchTerm, setSearchTerm] = useState(''); // Student search state

    const [editingStudentId, setEditingStudentId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editStudentId, setEditStudentId] = useState('');

    const fileInputRef = useRef(null);

    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [promotionConfig, setPromotionConfig] = useState({
        year: new Date().getFullYear() + 1,
        grade: '',
        classNum: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await analysisAPI.getStudents();
            setStudents(response.data.students);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await analysisAPI.addStudent({ name: newStudentName, studentId: newStudentId });
            setNewStudentName('');
            setNewStudentId('');
            fetchStudents();
        } catch (error) {
            alert('학생 등록 실패: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Map data to { name, studentId }
                // Supports explicit headers or tries to guess
                const parsedStudents = data.map(row => {
                    // Try to find name and studentId in various ways
                    let name = row['이름'] || row['Name'] || row['name'];
                    let studentId = row['학번'] || row['Student ID'] || row['studentId'] || row['id'];

                    // Fallback to column index if named keys fail
                    if (!name || !studentId) {
                        const values = Object.values(row);
                        if (!name && values.length > 0) name = values[0];
                        if (!studentId && values.length > 1) studentId = values[1];
                    }

                    return {
                        name: String(name).trim(),
                        studentId: String(studentId).trim()
                    };
                }).filter(s => s.name && s.studentId && s.name !== 'undefined' && s.studentId !== 'undefined');

                if (parsedStudents.length === 0) {
                    alert('엑셀 파일에서 학생 데이터를 찾을 수 없습니다. (헤더: 이름, 학번)');
                    return;
                }

                if (window.confirm(`${parsedStudents.length}명의 학생을 일괄 등록하시겠습니까?`)) {
                    const response = await analysisAPI.addStudentsBulk(parsedStudents);
                    alert(response.data.message);
                    fetchStudents();
                }

            } catch (error) {
                console.error('Excel processing error:', error);
                const errMsg = error.response?.data?.message || error.message || '알 수 없는 오류';
                alert(`오류가 발생했습니다:\n${errMsg}`);
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const startEditing = (student) => {
        setEditingStudentId(student._id);
        setEditName(student.name);
        setEditStudentId(student.studentId);
    };

    const handleUpdateStudent = async (id) => {
        try {
            await analysisAPI.updateStudent(id, { name: editName, studentId: editStudentId });
            setEditingStudentId(null);
            fetchStudents();
        } catch (error) {
            alert('학생 수정 실패: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm('정말로 이 학생을 삭제하시겠습니까?')) return;
        try {
            await analysisAPI.deleteStudent(id);
            fetchStudents();
        } catch (error) {
            alert('학생 삭제 실패: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDownloadTemplate = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['이름', '학번'], // Header
            ['홍길동(예시)', '20252401'], // 8-digit Example 1
            ['김철수(예시)', '20252402'], // 8-digit Example 2
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        // Set column widths
        ws['!cols'] = [{ wch: 15 }, { wch: 15 }];

        XLSX.utils.book_append_sheet(wb, ws, '학생명단');
        XLSX.writeFile(wb, '학생등록_양식.xlsx');
    };

    const getFilteredStudents = () => {
        let filtered = students;

        // 1. Filter by Teacher (Admin only)
        if (teacher?.role === 'admin' && selectedTeacher !== 'all') {
            filtered = filtered.filter(student => (student.teacherId?.name || '미배정') === selectedTeacher);
        }

        // 2. Filter by Search Term
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(lowerTerm) ||
                student.studentId.toLowerCase().includes(lowerTerm)
            );
        }

        return filtered;
    };

    const handleToggleStudent = (id) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedStudents(newSelected);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const visibleStudents = getFilteredStudents();
            setSelectedStudents(new Set(visibleStudents.map(s => s._id)));
        } else {
            setSelectedStudents(new Set());
        }
    };

    const handleBulkDelete = async () => {
        if (selectedStudents.size === 0) return;
        if (!window.confirm(`선택한 ${selectedStudents.size}명의 학생을 정말로 삭제하시겠습니까?`)) return;

        try {
            await analysisAPI.deleteStudentsBulk(Array.from(selectedStudents));
            setSelectedStudents(new Set());
            fetchStudents();
        } catch (error) {
            alert('일괄 삭제 실패: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleOpenPromotion = () => {
        if (selectedStudents.size === 0) {
            alert('승급할 학생을 먼저 선택해주세요.');
            return;
        }
        setShowPromotionModal(true);
    };

    const handleDownloadPromotionExcel = () => {
        const targetStudents = students.filter(s => selectedStudents.has(s._id));

        const wb = XLSX.utils.book_new();
        const wsData = [
            ['이름', '현재학번', '새학번(수정입력)'], // Header
            ...targetStudents.map(s => [s.name, s.studentId, ''])
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }];

        XLSX.utils.book_append_sheet(wb, ws, '승급명단');
        XLSX.writeFile(wb, '학생승급_양식.xlsx');
    };

    const handlePromotionExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Expected headers: 이름, 현재학번, 새학번(수정입력)

                const promotions = [];
                let failCount = 0;

                data.forEach(row => {
                    const currentId = row['현재학번'] || row['Student ID'];
                    const newId = row['새학번(수정입력)'] || row['New ID'] || row['새학번'];

                    if (currentId && newId) {
                        // Find original student to get _id
                        // We compare strings to avoid type issues
                        const student = students.find(s => String(s.studentId) === String(currentId));

                        if (student) {
                            promotions.push({
                                id: student._id,
                                newStudentId: String(newId).trim()
                            });
                        } else {
                            failCount++;
                        }
                    }
                });

                if (promotions.length === 0) {
                    alert('업데이트할 데이터가 없습니다. 엑셀 파일의 "새학번" 열을 확인해주세요.');
                    return;
                }

                if (window.confirm(`${promotions.length}명의 학생 정보를 업데이트하시겠습니까?` + (failCount > 0 ? `\n(매칭 실패: ${failCount}명)` : ''))) {
                    const response = await analysisAPI.promoteStudentsBulk(promotions);
                    alert(response.data.message);
                    setShowPromotionModal(false);
                    setSelectedStudents(new Set());
                    fetchStudents();
                }

            } catch (error) {
                console.error('Excel processing error:', error);
                const errMsg = error.response?.data?.message || error.message || '알 수 없는 오류';
                alert(`오류가 발생했습니다:\n${errMsg}`);
            } finally {
                // Reset file input
                e.target.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const renderStudentItem = (student) => (
        <div
            key={student._id}
            className="student-card"
            style={{
                padding: '1rem',
                background: selectedStudents.has(student._id) ? '#f0f9ff' : 'white',
                borderRadius: '0.5rem',
                border: selectedStudents.has(student._id) ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <input
                    type="checkbox"
                    checked={selectedStudents.has(student._id)}
                    onChange={() => handleToggleStudent(student._id)}
                    style={{ width: '1.2rem', height: '1.2rem', marginRight: '0.5rem', cursor: 'pointer' }}
                />
                {editingStudentId === student._id ? (
                    <div className="edit-form" style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="form-input"
                            style={{ padding: '0.25rem 0.5rem', flex: 1 }}
                        />
                        <input
                            type="text"
                            value={editStudentId}
                            onChange={(e) => setEditStudentId(e.target.value)}
                            className="form-input"
                            style={{ padding: '0.25rem 0.5rem', flex: 1 }}
                        />
                        <button onClick={() => handleUpdateStudent(student._id)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                            <span className="material-icons-round">check</span>
                        </button>
                        <button onClick={() => setEditingStudentId(null)} style={{ background: '#94a3b8', color: 'white', border: 'none', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{student.name}</span>
                            <span style={{ color: '#64748b', fontSize: '0.9rem', background: '#f1f5f9', padding: '0.1rem 0.5rem', borderRadius: '0.25rem' }}>
                                {student.studentId}
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => startEditing(student)}
                                title="수정"
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
                            >
                                <span className="material-icons-round">edit</span>
                            </button>
                            <button
                                onClick={() => handleDeleteStudent(student._id)}
                                title="삭제"
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                            >
                                <span className="material-icons-round">delete</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            {/* Promotion Modal */}
            {showPromotionModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', width: '90%', maxWidth: '500px' }}>
                        <h3 style={{ marginTop: 0 }}>학생 일괄 승급 (엑셀)</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            선택한 {selectedStudents.size}명의 학생 데이터를 엑셀로 다운로드 후,<br />
                            <b>새 학번</b>을 입력하여 업로드해주세요.<br />
                            <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>* 기존 출결 및 마일리지 기록은 유지됩니다.</span>
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#f8fafc' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>1단계: 명단 다운로드</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>선택 학생의 명단을 엑셀로 저장합니다.</span>
                                    <button
                                        onClick={handleDownloadPromotionExcel}
                                        style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        <span className="material-icons-round" style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}>download</span>
                                        다운로드
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#f8fafc' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>2단계: 수정 파일 업로드</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>새 학번이 입력된 엑셀을 업로드합니다.</span>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="file"
                                            onChange={handlePromotionExcelUpload}
                                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
                                            accept=".xlsx, .xls"
                                        />
                                        <button
                                            style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}
                                        >
                                            <span className="material-icons-round" style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}>upload_file</span>
                                            업로드 및 적용
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowPromotionModal(false)} style={{ padding: '0.5rem 1rem', background: '#ccc', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>닫기</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>학생 관리</h1>
                        <span className="subtitle">체계적인 학생 등록 및 관리</span>
                    </div>
                    <div className="header-actions">
                        <button onClick={() => navigate('/dashboard')} className="logout-button">
                            <span className="material-icons-round">arrow_back</span>
                            대시보드로 돌아가기
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="form-row">
                    <div className="input-area" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>학생 목록 ({students.length}명)</h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="submit-button"
                                    style={{ background: '#64748b', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center' }}
                                    title="등록 양식 다운로드"
                                >
                                    <span className="material-icons-round" style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>download</span>
                                    양식 다운로드
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleExcelUpload}
                                    style={{ display: 'none' }}
                                    accept=".xlsx, .xls"
                                />
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="submit-button"
                                    style={{ background: '#10b981', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center' }}
                                >
                                    <span className="material-icons-round" style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>upload_file</span>
                                    엑셀 일괄 등록
                                </button>
                                {selectedStudents.size > 0 && (
                                    <>
                                        <button
                                            onClick={handleOpenPromotion}
                                            className="submit-button"
                                            style={{ background: '#8b5cf6', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center' }}
                                        >
                                            <span className="material-icons-round" style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>upgrade</span>
                                            일괄 승급
                                        </button>
                                        <button
                                            onClick={handleBulkDelete}
                                            className="submit-button"
                                            style={{ background: '#ef4444', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center' }}
                                        >
                                            <span className="material-icons-round" style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>delete</span>
                                            선택 삭제 ({selectedStudents.size})
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '0.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    checked={getFilteredStudents().length > 0 && selectedStudents.size === getFilteredStudents().length}
                                    onChange={handleSelectAll}
                                    style={{ width: '1.2rem', height: '1.2rem', marginRight: '0.5rem', cursor: 'pointer' }}
                                />
                                <label htmlFor="selectAll" style={{ cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>
                                    전체 선택 ({getFilteredStudents().length}명)
                                </label>
                            </div>
                            <input
                                type="text"
                                placeholder="이름 또는 학번 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '0.25rem',
                                    border: '1px solid #cbd5e1',
                                    width: '200px'
                                }}
                            />
                        </div>


                        {/* Add Student Form */}
                        <form onSubmit={handleAddStudent} className="form-row" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                            <input
                                type="text"
                                placeholder="이름"
                                value={newStudentName}
                                onChange={(e) => setNewStudentName(e.target.value)}
                                className="form-input"
                                required
                            />
                            <input
                                type="text"
                                placeholder="학번 (ID)"
                                value={newStudentId}
                                onChange={(e) => setNewStudentId(e.target.value)}
                                className="form-input"
                                required
                            />
                            <button type="submit" className="submit-button" style={{ padding: '0.5rem 1rem' }}>
                                등록
                            </button>
                        </form>

                        <div className="students-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {students.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    등록된 학생이 없습니다. 학생을 등록하거나 엑셀로 일괄 등록하세요.
                                </div>
                            )}

                            {teacher?.role === 'admin' ? (
                                <>
                                    <div className="filter-section" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <label htmlFor="teacher-filter" style={{ fontWeight: '600', marginRight: '0.5rem', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                                                담당 선생님 선택:
                                            </label>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    placeholder="선생님 검색..."
                                                    value={teacherSearchTerm}
                                                    onChange={(e) => setTeacherSearchTerm(e.target.value)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        borderRadius: '0.25rem',
                                                        border: '1px solid #cbd5e1',
                                                        flex: 1
                                                    }}
                                                />
                                            </div>
                                            <select
                                                id="teacher-filter"
                                                value={selectedTeacher}
                                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                                style={{
                                                    padding: '0.5rem',
                                                    borderRadius: '0.25rem',
                                                    border: '1px solid #cbd5e1',
                                                    width: '100%'
                                                }}
                                            >
                                                <option value="all">전체보기 ({students.length}명)</option>
                                                {[...new Set(students.map(s => s.teacherId?.name || '미배정'))]
                                                    .filter(name => name.toLowerCase().includes(teacherSearchTerm.toLowerCase()))
                                                    .sort()
                                                    .map(name => (
                                                        <option key={name} value={name}>
                                                            {name} 선생님 ({students.filter(s => (s.teacherId?.name || '미배정') === name).length}명)
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {getFilteredStudents().length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                                검색 결과가 없습니다.
                                            </div>
                                        ) : (
                                            getFilteredStudents().map(student => renderStudentItem(student))
                                        )}
                                    </div>
                                </>
                            ) : (
                                // Teacher View: Flat List
                                <>
                                    {getFilteredStudents().length === 0 && searchTerm ? (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                            검색 결과가 없습니다.
                                        </div>
                                    ) : (
                                        getFilteredStudents().map(student => renderStudentItem(student))
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Attendance;
