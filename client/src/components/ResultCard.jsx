import React, { useState } from 'react';
import GuidanceStepExecutor from './GuidanceStepExecutor';
import StructuredGuidanceStep from './StructuredGuidanceStep';
import ErrorBoundary from './ErrorBoundary';

const ResultCard = ({ analysis }) => {
    const [copied, setCopied] = useState(false);
    const [expandedStep, setExpandedStep] = useState(0); // Default first step expanded

    // Helper to render values safely (handle objects/arrays)
    const renderSafe = (value) => {
        if (typeof value === 'object' && value !== null) {
            return Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
        }
        return value;
    };

    return (
        <div className="result-card fade-in">
            {/* Premium Incident Overview Header */}
            {/* Refined Incident Overview Header */}
            <div className="incident-header-card" style={{
                background: '#fff',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                marginBottom: '2rem',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                            <span style={{
                                background: '#e0f2fe',
                                color: '#0284c7',
                                padding: '0.3rem 0.8rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center'
                            }}>
                                <span className="material-icons-round" style={{ fontSize: '1rem', marginRight: '4px' }}>category</span>
                                {renderSafe(analysis.incidentType) || '사안 유형 미정'}
                            </span>
                            {analysis.riskLevel && (
                                <span style={{
                                    background: analysis.riskLevel === 'High' ? '#fef2f2' : (analysis.riskLevel === 'Medium' ? '#fff7ed' : '#f0fdf4'),
                                    color: analysis.riskLevel === 'High' ? '#dc2626' : (analysis.riskLevel === 'Medium' ? '#c2410c' : '#15803d'),
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    border: `1px solid ${analysis.riskLevel === 'High' ? '#fecaca' : (analysis.riskLevel === 'Medium' ? '#fed7aa' : '#bbf7d0')}`
                                }}>
                                    <span className="material-icons-round" style={{ fontSize: '1rem', marginRight: '4px' }}>
                                        {analysis.riskLevel === 'High' ? 'warning' : 'notifications'}
                                    </span>
                                    위험도: {
                                        {
                                            'High': '높음',
                                            'Medium': '중간',
                                            'Low': '낮음'
                                        }[analysis.riskLevel] || analysis.riskLevel
                                    }
                                </span>
                            )}
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#1e293b', fontWeight: '800', lineHeight: '1.4' }}>
                            {renderSafe(analysis.what) || '사안 내용이 없습니다.'}
                        </h2>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '1.5rem', minWidth: '120px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <span className="material-icons-round" style={{ fontSize: '0.9rem', marginRight: '4px' }}>event</span>
                            발생 일시
                        </div>
                        <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '1rem' }}>{renderSafe(analysis.when) || '-'}</div>
                    </div>
                </div>

                <div className="info-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    background: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '0.8rem',
                    border: '1px solid #f1f5f9'
                }}>
                    {[
                        { label: 'WHO (관련 학생)', value: analysis.who, icon: 'people' },
                        { label: 'WHERE (장소)', value: analysis.where, icon: 'place' },
                        { label: 'HOW (방법)', value: analysis.how, icon: 'settings' },
                        { label: 'WHY (이유)', value: analysis.why, icon: 'help_outline' }
                    ].map((item, idx) => (
                        <div key={idx} style={{ padding: '0.5rem' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: '700', letterSpacing: '0.5px', display: 'flex', alignItems: 'center' }}>
                                <span className="material-icons-round" style={{ fontSize: '0.9rem', marginRight: '4px', color: '#94a3b8' }}>{item.icon}</span>
                                {item.label}
                            </div>
                            <div style={{ color: '#334155', fontWeight: '500', fontSize: '0.95rem', lineHeight: '1.5' }}>{renderSafe(item.value) || '-'}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card-section">
                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', fontWeight: '700' }}>
                    <span className="material-icons-round" style={{ marginRight: '0.5rem', color: '#3b82f6' }}>school</span>
                    생활지도 가이드
                </h3>

                {analysis.guidanceSteps ? (
                    <div className="guidance-steps-stack" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {analysis.guidanceSteps.map((step, index) => {
                            const isExpanded = expandedStep === index;
                            return (
                                <div key={index} className={`step-card ${isExpanded ? 'expanded' : ''}`} style={{
                                    background: '#fff',
                                    borderRadius: '1rem',
                                    boxShadow: isExpanded ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {/* Step Header (Clickable) */}
                                    <div
                                        className="step-card-header"
                                        onClick={() => setExpandedStep(isExpanded ? null : index)} // Toggle expand
                                        style={{
                                            padding: '1.25rem',
                                            borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none',
                                            background: isExpanded ? '#f8fafc' : '#ffffff',
                                            borderRadius: isExpanded ? '1rem 1rem 0 0' : '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            marginRight: '1rem',
                                            background: isExpanded ? '#3b82f6' : '#e2e8f0',
                                            color: isExpanded ? 'white' : '#64748b',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            transition: 'all 0.3s'
                                        }}>
                                            {step.step}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.2rem' }}>STEP {step.step}</div>
                                            <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b' }}>{step.title}</h4>
                                        </div>
                                        <span className="material-icons-round" style={{
                                            color: '#94a3b8',
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s'
                                        }}>
                                            expand_more
                                        </span>
                                    </div>

                                    {/* Step Content (Conditionally Rendered) */}
                                    {isExpanded && (
                                        <div className="step-card-body fade-in" style={{ padding: '1.5rem', flex: 1 }}>
                                            <StructuredGuidanceStep step={step} />

                                            <div className="step-executor-container" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                                <ErrorBoundary>
                                                    <GuidanceStepExecutor
                                                        step={step}
                                                        analysis={analysis}
                                                        onUpdate={(data) => {
                                                            console.log('Step data updated:', data);
                                                        }}
                                                    />
                                                </ErrorBoundary>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div
                        className="guidance-text"
                        dangerouslySetInnerHTML={{ __html: analysis.guidance || '가이드 생성 실패' }}
                    />
                )
                }
            </div>

            {analysis.incidentId && (
                <div className="card-footer">
                    <span className="material-icons-round">save</span>
                    <small>데이터베이스에 저장됨 (ID: {analysis.incidentId})</small>
                </div>
            )}
        </div>
    );
};

export default ResultCard;
