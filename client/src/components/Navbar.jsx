
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Navbar = () => {
    const { teacher, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
            <div className="header-content">
                <div className="header-title" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                    <h1>생활지도 도우미 (AI)</h1>
                    <p className="subtitle">제미나이가 분석하는 학생 사안 처리</p>
                </div>
                <div className="header-actions">
                    {teacher?.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin/teachers')}
                            className="logout-button"
                            style={{
                                background: isActive('/admin/teachers') ? '#fef3c7' : '#fffbeb',
                                color: '#b45309',
                                borderColor: isActive('/admin/teachers') ? '#f59e0b' : '#fde68a'
                            }}
                        >
                            <span className="material-icons-round">manage_accounts</span>
                            선생님 관리
                        </button>
                    )}



                    <button
                        onClick={() => navigate('/history')}
                        className="logout-button"
                        style={{
                            background: isActive('/history') ? '#f0fdf4' : '#f8fafc',
                            color: isActive('/history') ? '#16a34a' : '#64748b',
                            borderColor: isActive('/history') ? '#bbf7d0' : '#e2e8f0'
                        }}
                    >
                        <span className="material-icons-round">history_edu</span>
                        기록 관리
                    </button>

                    <button
                        onClick={() => navigate('/students')}
                        className="logout-button"
                        style={{
                            background: isActive('/students') ? '#f0f9ff' : '#f8fafc',
                            color: isActive('/students') ? '#0284c7' : '#64748b',
                            borderColor: isActive('/students') ? '#bae6fd' : '#e2e8f0'
                        }}
                    >
                        <span className="material-icons-round">people</span>
                        학생 관리
                    </button>

                    <div className="teacher-info">
                        <span className="material-icons-round">account_circle</span>
                        <span>{teacher?.name || '교사'}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                        <span className="material-icons-round">logout</span>
                        로그아웃
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
