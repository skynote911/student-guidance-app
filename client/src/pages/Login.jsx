import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || '로그인에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="material-icons-round auth-icon">school</span>
                    <h1>생활지도 도우미</h1>
                    <p className="auth-subtitle">교사 로그인</p>
                </div>

                {error && (
                    <div className="error-message">
                        <span className="material-icons-round">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">이메일</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="teacher@school.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="material-icons-round spinning">autorenew</span>
                                로그인 중...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-round">login</span>
                                로그인
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        계정이 없으신가요?{' '}
                        <Link to="/register" className="auth-link">회원가입</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
