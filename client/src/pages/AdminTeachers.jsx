import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import '../styles/Dashboard.css';

const AdminTeachers = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const response = await adminAPI.getTeachers();
            setTeachers(response.data.teachers);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            if (error.response?.status === 403) {
                alert('관리자 권한이 없습니다.');
                navigate('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeacher = async (id, name) => {
        if (!window.confirm(`정말로 선생님 '${name}'의 계정을 삭제하시겠습니까?\n해당 선생님이 등록한 모든 학생 데이터도 함께 삭제됩니다.`)) return;

        try {
            await adminAPI.deleteTeacher(id);
            alert('계정이 삭제되었습니다.');
            fetchTeachers();
        } catch (error) {
            alert('삭제 실패: ' + (error.response?.data?.message || '오류가 발생했습니다.'));
        }
    };

    const handleResetPassword = async (id, name) => {
        if (!window.confirm(`선생님 '${name}'의 비밀번호를 '123456'으로 초기화하시겠습니까?`)) return;

        try {
            await adminAPI.resetTeacherPassword(id);
            alert('비밀번호가 초기화되었습니다 (123456).');
        } catch (error) {
            alert('초기화 실패: ' + (error.response?.data?.message || '오류가 발생했습니다.'));
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>선생님 관리 (Admin)</h1>
                        <span className="subtitle">전체 교사 계정 및 권한 관리</span>
                    </div>
                    <div className="header-actions">
                        <button onClick={() => navigate('/dashboard')} className="logout-button">
                            <span className="material-icons-round">arrow_back</span>
                            대시보드로 돌아가기
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div className="form-row">
                    <div className="input-area" style={{ width: '100%' }}>
                        <h3>등록된 선생님 목록 ({teachers.length}명)</h3>

                        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#475569' }}>이름</th>
                                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#475569' }}>이메일</th>
                                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#475569' }}>학교급</th>
                                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#475569' }}>권한</th>
                                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#475569' }}>가입일</th>
                                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#475569' }}>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.map(teacher => (
                                        <tr key={teacher._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '0.75rem' }}>{teacher.name}</td>
                                            <td style={{ padding: '0.75rem' }}>{teacher.email}</td>
                                            <td style={{ padding: '0.75rem' }}>{teacher.schoolLevel}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.8rem',
                                                    background: teacher.role === 'admin' ? '#dbeafe' : '#f1f5f9',
                                                    color: teacher.role === 'admin' ? '#1e40af' : '#64748b'
                                                }}>
                                                    {teacher.role === 'admin' ? '관리자' : '일반교사'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>
                                                {new Date(teacher.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleResetPassword(teacher._id, teacher.name)}
                                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                                                >
                                                    비번초기화
                                                </button>
                                                {teacher.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDeleteTeacher(teacher._id, teacher.name)}
                                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                                                    >
                                                        삭제
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminTeachers;
