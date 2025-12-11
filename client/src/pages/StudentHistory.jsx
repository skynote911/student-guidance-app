
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import '../styles/Dashboard.css';

const StudentHistory = () => {
    const navigate = useNavigate();
    const { teacher } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Admin Filter States
    const [selectedTeacher, setSelectedTeacher] = useState('all');

    // Edit State
    const [editingIncidentId, setEditingIncidentId] = useState(null);
    const [editContent, setEditContent] = useState('');

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

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const handleStudentClick = async (student) => {
        setSelectedStudent(student);
        setSelectedIncident(null);
        setHistoryLoading(true);
        setEditingIncidentId(null);
        try {
            // studentId is the unique identifier string (e.g. "20240101")
            const response = await analysisAPI.getStudentHistory(student.studentId);
            if (response.data.success) {
                setHistoryData(response.data.incidents || []);
            } else {
                setHistoryData([]);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            alert('기록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleDownload = () => {
        if (!historyData || historyData.length === 0) {
            alert('다운로드할 기록이 없습니다.');
            return;
        }

        const dataToExport = historyData.map(incident => ({
            '날짜': new Date(incident.incidentDate).toLocaleDateString(),
            '유형': incident.incidentType,
            '내용': incident.teacherNote || incident.aiAnalysis?.neis || incident.aiAnalysis?.neisRecord || incident.aiAnalysis?.original || '내용 없음',
            '작성자': teacher.role === 'admin' ? (students.find(s => s.studentId === incident.studentId)?.teacherId?.name || '미배정') : '본인'
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "학생생활지도기록");

        const fileName = `${selectedStudent.name}_생활지도기록_${new Date().toLocaleDateString().replace(/\./g, '').replace(/ /g, '-')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const handleEditStart = (incident) => {
        setEditingIncidentId(incident._id);
        const content = incident.teacherNote || incident.aiAnalysis?.neis || incident.aiAnalysis?.neisRecord || incident.aiAnalysis?.original || '';
        setEditContent(content);
    };

    const handleEditSave = async (id) => {
        try {
            const response = await analysisAPI.updateIncident(id, { content: editContent });
            if (response.data.success) {
                // Update local state
                setHistoryData(prev => prev.map(inc =>
                    inc._id === id ? { ...inc, teacherNote: editContent } : inc
                ));
                setEditingIncidentId(null);
                alert('수정되었습니다.');
            }
        } catch (error) {
            console.error('Edit error:', error);
            alert('수정 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말로 이 기록을 삭제하시겠습니까? 복구할 수 없습니다.')) return;

        try {
            const response = await analysisAPI.deleteIncident(id);
            if (response.data.success) {
                setHistoryData(prev => prev.filter(inc => inc._id !== id));
                alert('삭제되었습니다.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            const message = error.response?.data?.message || '삭제 중 오류가 발생했습니다.';
            alert(message);
        }
    };

    const getFilteredStudents = () => {
        let filtered = students;

        // 1. Teacher Filter (Admin only)
        if (teacher.role === 'admin') {
            if (selectedTeacher !== 'all') {
                filtered = filtered.filter(s => (s.teacherId?.name || '미배정') === selectedTeacher);
            }
        } else {
            // Regular teacher: only see own students
            filtered = filtered.filter(s => s.teacherId?._id === teacher.id || s.teacherId === teacher.id);
        }

        // 2. Search Term Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(lowerTerm) ||
                s.studentId.toLowerCase().includes(lowerTerm)
            );
        }
        return filtered;
    };

    return (
        <div className="student-history-page">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>학생 생활지도 기록 관리</h1>
                        <span className="subtitle">학생별 상담 및 지도 기록 조회/수정</span>
                    </div>
                    <div className="header-actions">
                        <button onClick={handleBackToDashboard} className="logout-button">
                            <span className="material-icons-round">arrow_back</span>
                            대시보드로 돌아가기
                        </button>
                    </div>
                </div>
            </header>

            <div className="dashboard-container" style={{
                maxWidth: '1600px',
                display: 'grid',
                gridTemplateColumns: 'minmax(380px, 1fr) 2fr',
                gap: '2rem',
                alignItems: 'start',
                marginTop: '2rem'
            }}>
                {/* Left Panel: Student List */}
                <div className="card" style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>학생 목록</h2>

                        {/* Admin Teacher Filter */}
                        {teacher.role === 'admin' && (
                            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569', fontSize: '0.9rem' }}>
                                    담당 선생님 필터
                                </label>
                                <select
                                    value={selectedTeacher}
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid #cbd5e1',
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    <option value="all">전체보기 ({students.length}명)</option>
                                    {[...new Set(students.map(s => s.teacherId?.name || '미배정'))]
                                        .sort()
                                        .map(name => (
                                            <option key={name} value={name}>
                                                {name} 선생님 ({students.filter(s => (s.teacherId?.name || '미배정') === name).length}명)
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}

                        <div className="search-box" style={{ position: 'relative' }}>
                            <span className="material-icons-round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>search</span>
                            <input
                                type="text"
                                placeholder="이름 또는 학번 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    fontSize: '1.1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '0.75rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    <div className="student-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '1rem',
                        overflowY: 'auto',
                        paddingRight: '0.5rem'
                    }}>
                        {loading ? (
                            <p>학생 목록을 불러오는 중...</p>
                        ) : getFilteredStudents().length > 0 ? (
                            getFilteredStudents().map(student => (
                                <div
                                    key={student._id}
                                    onClick={() => handleStudentClick(student)}
                                    style={{
                                        padding: '1.2rem',
                                        background: selectedStudent?._id === student._id ? '#eff6ff' : 'white',
                                        border: selectedStudent?._id === student._id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                        borderRadius: '1rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'center',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ width: '45px', height: '45px', background: '#f1f5f9', borderRadius: '50%', margin: '0 auto 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-icons-round" style={{ color: '#64748b', fontSize: '24px' }}>person</span>
                                    </div>
                                    <h3 style={{ margin: '0 0 0.3rem', fontSize: '1rem', color: '#1e293b' }}>{student.name}</h3>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem', background: '#f8fafc', padding: '0.1rem 0.5rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '0.5rem' }}>
                                        {student.studentId}
                                    </span>
                                    {teacher.role === 'admin' && (
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                            {student.teacherId?.name || '미배정'}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                                학생이 없습니다.
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Panel: History Details */}
                <div className="card" style={{ height: 'calc(100vh - 150px)', overflowY: 'auto', padding: '2rem' }}>
                    {selectedStudent ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#1e293b' }}>
                                        {selectedStudent.name} <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 'normal' }}>({selectedStudent.studentId})</span>
                                    </h2>
                                    <p style={{ color: '#64748b' }}>
                                        {selectedIncident ? '기록 상세 조회' : `총 지도 기록: ${historyData.length}건`}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {selectedIncident ? (
                                        <button
                                            className="action-button"
                                            onClick={() => setSelectedIncident(null)}
                                            style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}
                                        >
                                            <span className="material-icons-round">arrow_back</span>
                                            목록으로
                                        </button>
                                    ) : (
                                        <button
                                            className="action-button"
                                            onClick={handleDownload}
                                            style={{ width: 'auto' }}
                                        >
                                            <span className="material-icons-round">download</span>
                                            엑셀 다운로드
                                        </button>
                                    )}
                                </div>
                            </div>

                            {historyLoading ? (
                                <div style={{ textAlign: 'center', padding: '4rem' }}>
                                    <div className="loading-spinner"></div>
                                    <p>기록을 불러오는 중입니다...</p>
                                </div>
                            ) : selectedIncident ? (
                                // Detail View (Single Incident)
                                <div className="history-detail-view">
                                    <div className="history-item" style={{
                                        background: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '1rem',
                                        padding: '2rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <span style={{
                                                    background: '#eff6ff',
                                                    color: '#2563eb',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    fontWeight: '600',
                                                    fontSize: '1rem'
                                                }}>
                                                    {selectedIncident.incidentType}
                                                </span>
                                                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                                                    <span>
                                                        <span style={{ fontSize: '0.8rem', marginRight: '4px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>등록</span>
                                                        {new Date(selectedIncident.incidentDate).toLocaleDateString()}
                                                    </span>
                                                    {(selectedIncident.aiAnalysis?.when && selectedIncident.aiAnalysis.when !== '미상') && (
                                                        <span style={{ color: '#ef4444', fontWeight: '600' }}>
                                                            <span style={{ fontSize: '0.8rem', marginRight: '4px', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>발생</span>
                                                            {selectedIncident.aiAnalysis.when}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {editingIncidentId === selectedIncident._id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditSave(selectedIncident._id)}
                                                            className="save-btn"
                                                            style={{ background: '#22c55e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                        >
                                                            <span className="material-icons-round">check</span> 저장
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingIncidentId(null)}
                                                            style={{ background: '#94a3b8', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                                                        >
                                                            <span className="material-icons-round">close</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditStart(selectedIncident)}
                                                            style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                        >
                                                            <span className="material-icons-round" style={{ fontSize: '1.2rem' }}>edit</span> 수정
                                                        </button>
                                                        <button
                                                            onClick={() => { handleDelete(selectedIncident._id); setSelectedIncident(null); }}
                                                            style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                        >
                                                            <span className="material-icons-round" style={{ fontSize: '1.2rem' }}>delete</span> 삭제
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {editingIncidentId === selectedIncident._id ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <label style={{ fontWeight: 'bold', color: '#475569' }}>내용 수정 (나이스 입력용)</label>
                                                    <button onClick={() => setEditingIncidentId(null)} style={{ fontSize: '0.9rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>취소</button>
                                                </div>
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    style={{ width: '100%', minHeight: '300px', padding: '1rem', borderRadius: '0.5rem', border: '2px solid #3b82f6', lineHeight: '1.6', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                                                />
                                            </div>
                                        ) : (() => {
                                            // Parsing Logic for Merged Content
                                            const rawContent = selectedIncident.teacherNote || selectedIncident.aiAnalysis?.neis || selectedIncident.aiAnalysis?.neisRecord || '내용이 없습니다.';
                                            let neisContent = rawContent;
                                            let whoContent = selectedIncident.aiAnalysis?.whoRecord || '';

                                            // Check if rawContent has [누가기록] separator
                                            if (typeof rawContent === 'string' && rawContent.includes('[누가기록]')) {
                                                const parts = rawContent.split('[누가기록]');
                                                neisContent = parts[0].trim();
                                                // If whoContent was empty, take it from the split (adding back the tag for context if desired)
                                                if (!whoContent) {
                                                    whoContent = '[누가기록]' + parts[1];
                                                }
                                            }

                                            // Fallback for Who Content if still empty
                                            if (!whoContent) {
                                                const analysis = selectedIncident.aiAnalysis || {};
                                                whoContent = `[누가] ${analysis.who || '미상'}\n[언제] ${analysis.when || '미상'}\n[어디서] ${analysis.where || '미상'}\n[무엇을] ${analysis.what || '내용 없음'}\n[어떻게] ${analysis.how || '미상'}\n[왜] ${analysis.why || '미상'}`;
                                            }

                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                    {/* 1. NEIS Record Card (Step 4 Style) */}
                                                    <div className="icon-card" style={{
                                                        background: '#fff',
                                                        borderRadius: '0.8rem',
                                                        border: '1px solid #e2e8f0',
                                                        padding: '1.2rem',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
                                                            <label style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                                                                <span className="material-icons-round" style={{ marginRight: '0.6rem', color: '#3b82f6' }}>description</span>
                                                                나이스(NEIS) 입력용
                                                            </label>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(neisContent);
                                                                    alert('나이스(NEIS) 기록이 복사되었습니다.');
                                                                }}
                                                                style={{
                                                                    padding: '0.4rem 0.8rem',
                                                                    fontSize: '0.85rem',
                                                                    background: '#f1f5f9',
                                                                    color: '#475569',
                                                                    border: 'none',
                                                                    borderRadius: '0.4rem',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    fontWeight: '600',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                            >
                                                                <span className="material-icons-round" style={{ fontSize: '1rem', marginRight: '4px' }}>content_copy</span>
                                                                복사
                                                            </button>
                                                        </div>
                                                        <div style={{
                                                            background: '#f8fafc',
                                                            padding: '1rem',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '1rem',
                                                            lineHeight: '1.6',
                                                            color: '#334155',
                                                            border: '1px solid #e2e8f0',
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {neisContent}
                                                        </div>
                                                    </div>

                                                    {/* 2. Who Record Card (Step 4 Style) */}
                                                    <div className="icon-card" style={{
                                                        background: '#fff',
                                                        borderRadius: '0.8rem',
                                                        border: '1px solid #e2e8f0',
                                                        padding: '1.2rem',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
                                                            <label style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                                                                <span className="material-icons-round" style={{ marginRight: '0.6rem', color: '#f59e0b' }}>history_edu</span>
                                                                누가기록 (상세 정보)
                                                            </label>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(whoContent);
                                                                    alert('누가기록이 복사되었습니다.');
                                                                }}
                                                                style={{
                                                                    padding: '0.4rem 0.8rem',
                                                                    fontSize: '0.85rem',
                                                                    background: '#fffbeb',
                                                                    color: '#d97706',
                                                                    border: 'none',
                                                                    borderRadius: '0.4rem',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    fontWeight: '600',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                            >
                                                                <span className="material-icons-round" style={{ fontSize: '1rem', marginRight: '4px' }}>content_copy</span>
                                                                복사
                                                            </button>
                                                        </div>
                                                        <div style={{
                                                            background: '#fffbeb',
                                                            padding: '1rem',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '1rem',
                                                            lineHeight: '1.6',
                                                            color: '#78350f',
                                                            border: '1px solid #fcd34d',
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {(() => {
                                                                const perpMatch = whoContent.match(/가해\s*학생\s*:?\s*"?(.*?)"?(?=\s*피해\s*학생|$)/s);
                                                                const vicMatch = whoContent.match(/피해\s*학생\s*:?\s*"?(.*?)"?$/s);

                                                                if (perpMatch || vicMatch) {
                                                                    return (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                                            {perpMatch && (
                                                                                <div>
                                                                                    <span style={{ fontWeight: 'bold', color: '#dc2626', display: 'block', marginBottom: '0.2rem' }}>가해학생 내용 :</span>
                                                                                    <div style={{ paddingLeft: '0.5rem', borderLeft: '2px solid #fecaca', lineHeight: '1.5' }}>
                                                                                        {perpMatch[1].trim()}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {vicMatch && (
                                                                                <div>
                                                                                    <span style={{ fontWeight: 'bold', color: '#2563eb', display: 'block', marginBottom: '0.2rem' }}>피해학생 내용 :</span>
                                                                                    <div style={{ paddingLeft: '0.5rem', borderLeft: '2px solid #bfdbfe', lineHeight: '1.5' }}>
                                                                                        {vicMatch[1].trim()}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }
                                                                return whoContent;
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ) : historyData.length > 0 ? (
                                // List View
                                <div className="history-list" style={{ display: 'grid', gap: '1rem' }}>
                                    {historyData.map((incident) => (
                                        <div
                                            key={incident._id}
                                            onClick={() => setSelectedIncident(incident)}
                                            className="history-list-item"
                                            style={{
                                                background: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '0.75rem',
                                                padding: '1.2rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '1rem'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    background: '#f1f5f9',
                                                    padding: '0.5rem 0.8rem',
                                                    borderRadius: '0.5rem',
                                                    minWidth: '60px'
                                                }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        {new Date(incident.incidentDate).getMonth() + 1}월
                                                    </span>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>
                                                        {new Date(incident.incidentDate).getDate()}
                                                    </span>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{
                                                                fontSize: '0.8rem',
                                                                background: '#eff6ff',
                                                                color: '#2563eb',
                                                                padding: '0.1rem 0.4rem',
                                                                borderRadius: '0.25rem',
                                                                fontWeight: '600'
                                                            }}>
                                                                {incident.incidentType}
                                                            </span>
                                                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                                                                {incident.aiAnalysis?.who || '관련 학생 미상'}
                                                            </span>
                                                        </div>
                                                        {(incident.aiAnalysis?.when && incident.aiAnalysis.when !== '미상') && (
                                                            <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '600' }}>
                                                                <span style={{ background: '#fee2e2', padding: '1px 4px', borderRadius: '4px', marginRight: '4px' }}>발생</span>
                                                                {incident.aiAnalysis.when}
                                                            </div>
                                                        )}
                                                        <p style={{
                                                            margin: 0,
                                                            fontSize: '0.95rem',
                                                            color: '#475569',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: '1.5'
                                                        }}>
                                                            {incident.aiAnalysis?.what || incident.teacherNote || '내용 없음'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(incident._id);
                                                    }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#cbd5e1',
                                                        cursor: 'pointer',
                                                        padding: '0.4rem',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fee2e2'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; }}
                                                    title="삭제"
                                                >
                                                    <span className="material-icons-round" style={{ fontSize: '1.2rem' }}>delete</span>
                                                </button>
                                                <span className="material-icons-round" style={{ color: '#cbd5e1' }}>chevron_right</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                                    <span className="material-icons-round" style={{ fontSize: '48px', marginBottom: '1rem' }}>article</span>
                                    <p>등록된 지도 기록이 없습니다.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <span className="material-icons-round" style={{ fontSize: '64px', marginBottom: '1.5rem', color: '#e2e8f0' }}>touch_app</span>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#64748b' }}>학생을 선택해주세요</h3>
                            <p>왼쪽 목록에서 학생을 선택하면 상세 기록을 확인할 수 있습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentHistory;
