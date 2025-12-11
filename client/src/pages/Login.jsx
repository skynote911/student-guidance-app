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
            // Detailed Error Handling for Debugging
            if (err.response) {
                // Server responded with an error (4xx, 5xx)
                setError(`서버 오류 (${err.response.status}): ${err.response.data?.message || '알 수 없는 오류'}`);
            } else if (err.request) {
                // Request made but no response (Network Error)
                setError(`서버 연결 실패: 응답이 없습니다. (API URL 확인 필요) - ${err.message}`);
            } else {
                // Other errors
                setError(`오류 발생: ${err.message}`);
            }
            console.error('Login Error Detail:', err);
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
                    <p className="auth-subtitle">교사 로그인 (v2.1 Hardcoded)</p>
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
