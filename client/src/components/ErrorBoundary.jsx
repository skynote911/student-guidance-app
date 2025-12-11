import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    margin: '1rem',
                    color: '#991b1b'
                }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <span className="material-icons-round" style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>error_outline</span>
                        화면을 표시하는 중 오류가 발생했습니다.
                    </h3>
                    <div style={{ background: '#fff', padding: '1rem', borderRadius: '0.4rem', overflow: 'auto', maxHeight: '200px', fontSize: '0.9rem', border: '1px solid #fee2e2' }}>
                        <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>{this.state.error?.toString()}</p>
                        <pre style={{ margin: 0, color: '#64748b' }}>{this.state.errorInfo?.componentStack}</pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
