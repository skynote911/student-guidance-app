import React, { useState, useRef } from 'react';
import { analysisAPI } from '../services/api';
import ActionGenerator from './ActionGenerator';
import PatternInsights from './PatternInsights';
import StructuredGuidanceStep from './StructuredGuidanceStep';
import '../styles/GuidanceStepExecutor.css';

/**
 * 생활지도 가이드 단계별 실행 컴포넌트
 * 각 단계의 기능을 실제로 실행할 수 있게 해주는 컴포넌트
 */
const GuidanceStepExecutor = ({ step, analysis, onUpdate }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [nonVerbalNotes, setNonVerbalNotes] = useState({
        eyeContact: false,
        tears: false,
        voiceTrembling: false,
        withdrawn: false,
        anger: 0, // 0-10 척도
        anxiety: false
    });
    const [notes, setNotes] = useState('');
    const [allHistories, setAllHistories] = useState({});
    const [loadingHistories, setLoadingHistories] = useState(false);
    const [expandedIncidentIndex, setExpandedIncidentIndex] = useState(null);

    // Step 1 진입 시 관련 학생들의 누가기록 자동 조회
    React.useEffect(() => {
        if (step.step === 1 && analysis) {
            const fetchHistories = async () => {
                const students = analysis.involvedStudents && analysis.involvedStudents.length > 0
                    ? analysis.involvedStudents
                    : (analysis.studentId && analysis.studentId !== 'unknown' ? [{ id: analysis.studentId, name: '학생' }] : []);

                if (students.length === 0) return;

                setLoadingHistories(true);
                const histories = {};

                try {
                    await Promise.all(students.map(async (student) => {
                        if (student.id) {
                            try {
                                const response = await analysisAPI.getStudentHistory(student.id);
                                if (response.data.success) {
                                    histories[student.id] = response.data.incidents || [];
                                }
                            } catch (err) {
                                console.error(`Error fetching history for ${student.name}:`, err);
                            }
                        }
                    }));
                    setAllHistories(histories);
                } catch (error) {
                    console.error('History fetch error:', error);
                } finally {
                    setLoadingHistories(false);
                }
            };

            fetchHistories();
        }
    }, [step.step, analysis.incidentId]);

    // 단계별 기능 렌더링
    const handleDeleteHistory = async (incidentId, studentId) => {
        try {
            await analysisAPI.deleteIncident(incidentId);
            setAllHistories(prev => ({
                ...prev,
                [studentId]: prev[studentId].filter(item => item._id !== incidentId)
            }));
        } catch (error) {
            console.error('Delete history error:', error);
            alert('기록 삭제 중 오류가 발생했습니다.');
        }
    };

    const renderStepContent = () => {
        switch (step.step) {
            case 1:
                const studentsToCheck = analysis.involvedStudents && analysis.involvedStudents.length > 0
                    ? analysis.involvedStudents
                    : (analysis.studentId && analysis.studentId !== 'unknown' ? [{ id: analysis.studentId, name: '학생' }] : []);

                return (
                    <div className="step-executor">
                        {analysis?.who && (
                            <div className="history-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
                                        <span className="material-icons-round" style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: '#3b82f6' }}>history</span>
                                        학생 누적 기록 확인
                                    </h4>
                                </div>

                                {loadingHistories ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                        <span className="material-icons-round" style={{ animation: 'spin 1s infinite linear', marginRight: '0.5rem', verticalAlign: 'middle' }}>refresh</span>
                                        기록을 불러오는 중...
                                    </div>
                                ) : studentsToCheck.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {studentsToCheck.map((student, sIdx) => {
                                            const incidents = allHistories[student.id] || [];
                                            return (
                                                <div key={student.id || sIdx} style={{
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '0.8rem',
                                                    overflow: 'hidden',
                                                    background: '#fff',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                }}>
                                                    {/* Student Header */}
                                                    <div style={{
                                                        padding: '1rem',
                                                        background: '#f8fafc',
                                                        borderBottom: '1px solid #e2e8f0',
                                                        fontWeight: '600',
                                                        color: '#334155',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        <span className="material-icons-round" style={{ marginRight: '0.5rem', color: '#64748b', fontSize: '1.1rem' }}>person</span>
                                                        {student.name}
                                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'normal' }}>
                                                            ({incidents.length}건)
                                                        </span>
                                                    </div>

                                                    {/* Incident List */}
                                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                        {incidents.length > 0 ? (
                                                            incidents.map((incident, idx) => {
                                                                const uniqueKey = `${student.id}-${idx}`;
                                                                const isExpanded = expandedIncidentIndex === uniqueKey;

                                                                return (
                                                                    <div key={idx} style={{
                                                                        borderBottom: idx === incidents.length - 1 ? 'none' : '1px solid #f1f5f9',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                    }}>
                                                                        {/* Summary Row */}
                                                                        <div
                                                                            onClick={() => setExpandedIncidentIndex(isExpanded ? null : uniqueKey)}
                                                                            style={{
                                                                                padding: '1rem',
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                alignItems: 'center',
                                                                                cursor: 'pointer',
                                                                                background: isExpanded ? '#f8fafc' : '#fff',
                                                                                transition: 'background 0.2s'
                                                                            }}
                                                                        >
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                                                    {new Date(incident.incidentDate).toLocaleDateString()}
                                                                                </span>
                                                                                <span style={{
                                                                                    background: '#eff6ff',
                                                                                    color: '#3b82f6',
                                                                                    padding: '0.1rem 0.6rem',
                                                                                    borderRadius: '1rem',
                                                                                    fontSize: '0.75rem',
                                                                                    fontWeight: '600'
                                                                                }}>
                                                                                    {incident.incidentType}
                                                                                </span>
                                                                            </div>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        if (window.confirm('정말 삭제하시겠습니까?')) {
                                                                                            handleDeleteHistory(incident._id, student.id);
                                                                                        }
                                                                                    }}
                                                                                    className="delete-history-btn"
                                                                                    style={{
                                                                                        border: 'none',
                                                                                        background: 'none',
                                                                                        color: '#cbd5e1',
                                                                                        cursor: 'pointer',
                                                                                        padding: '4px',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        borderRadius: '4px',
                                                                                        transition: 'all 0.2s'
                                                                                    }}
                                                                                    onMouseOver={(e) => {
                                                                                        e.currentTarget.style.color = '#ef4444';
                                                                                        e.currentTarget.style.background = '#fee2e2';
                                                                                    }}
                                                                                    onMouseOut={(e) => {
                                                                                        e.currentTarget.style.color = '#cbd5e1';
                                                                                        e.currentTarget.style.background = 'none';
                                                                                    }}
                                                                                    title="기록 삭제"
                                                                                >
                                                                                    <span className="material-icons-round" style={{ fontSize: '1.1rem' }}>delete</span>
                                                                                </button>
                                                                                <span className="material-icons-round" style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                                                                                    {isExpanded ? 'expand_less' : 'expand_more'}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Details */}
                                                                        {isExpanded && (
                                                                            <div style={{
                                                                                padding: '0 1rem 1rem 1rem',
                                                                                fontSize: '0.95rem',
                                                                                color: '#334155',
                                                                                lineHeight: '1.6',
                                                                                background: '#f8fafc',
                                                                                borderTop: '1px solid #f1f5f9'
                                                                            }}>
                                                                                <div style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                                                                                    {/* Render Who split if available */}
                                                                                    {(() => {
                                                                                        const rawContent = incident.teacherNote || incident.aiAnalysis?.neisRecord || incident.aiAnalysis?.neis || '내용 없음';
                                                                                        const content = String(rawContent);
                                                                                        const parts = content.split('[누가기록]');
                                                                                        const hasWho = parts.length > 1;
                                                                                        const displayContent = hasWho ? parts[1].trim() : content;

                                                                                        // Visual separation for Perpetrator/Victim
                                                                                        const perpMatch = displayContent.match(/가해\s*학생\s*:?\s*"?(.*?)"?(?=\s*피해\s*학생|$)/s);
                                                                                        const vicMatch = displayContent.match(/피해\s*학생\s*:?\s*"?(.*?)"?$/s);

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
                                                                                        return displayContent;
                                                                                    })()}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                                기록된 사안이 없습니다.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                        확인할 학생 정보가 없습니다.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 2:
                // 학교폭력 4대 요소 분석 결과 표시
                return (
                    <div className="step-executor">
                        {/* 0. 패턴 및 재발 위험성 (Pattern Insights Moved Here) */}
                        {analysis.patterns && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <PatternInsights patterns={analysis.patterns} />
                            </div>
                        )}

                        {analysis?.schoolViolenceScore ? (
                            <div className="school-violence-analysis" style={{ padding: '1rem', background: '#fff', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', display: 'flex', alignItems: 'center' }}>
                                    <span className="material-icons-round" style={{ color: '#ef4444', marginRight: '0.5rem' }}>gavel</span>
                                    사안 심각성 분석 (학교폭력 4대 요소)
                                </h4>
                                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                    {['intentionality', 'severity', 'continuity', 'repentance'].map((key) => {
                                        const labels = {
                                            intentionality: '고의성',
                                            severity: '심각성',
                                            continuity: '지속성',
                                            repentance: '반성 정도'
                                        };
                                        const item = analysis.schoolViolenceScore[key];
                                        const isObject = item && typeof item === 'object';
                                        const score = isObject ? item.score : item;
                                        const reason = isObject ? item.reason : '';

                                        return (
                                            <div key={key} style={{ padding: '0.8rem', background: '#f8fafc', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>{labels[key]}</div>
                                                <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                                                    {score || '분석 불가'}
                                                </div>
                                                {reason && (
                                                    <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4', background: '#fff', padding: '0.4rem', borderRadius: '0.3rem', border: '1px solid #f1f5f9' }}>
                                                        {reason}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* 긴급 조치 판단 (AI 분석 결과) */}
                                {analysis.schoolViolenceScore.judgment && (
                                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                        <h5 style={{ margin: '0 0 0.8rem 0', color: '#d97706', display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                                            <span className="material-icons-round" style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>warning_amber</span>
                                            긴급 조치 판단 (AI 분석)
                                        </h5>
                                        <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fcd34d' }}>
                                            <div style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 'bold', color: '#92400e', marginRight: '0.5rem', minWidth: '40px' }}>판단:</span>
                                                <span style={{ fontWeight: 'bold', color: '#b45309', fontSize: '1.1rem' }}>{analysis.schoolViolenceScore.judgment.decision}</span>
                                            </div>

                                            {/* 적용 기준 (새로 추가됨) */}
                                            {analysis.schoolViolenceScore.judgment.criteria && (
                                                <div style={{ marginBottom: '0.8rem' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#92400e', display: 'block', marginBottom: '0.3rem' }}>적용 기준:</span>
                                                    <div style={{ fontSize: '0.9rem', color: '#b45309', background: 'rgba(255, 255, 255, 0.5)', padding: '0.5rem', borderRadius: '0.3rem' }}>
                                                        {analysis.schoolViolenceScore.judgment.criteria}
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ marginBottom: '1rem' }}>
                                                <span style={{ fontWeight: 'bold', color: '#92400e', display: 'block', marginBottom: '0.3rem' }}>상세 근거:</span>
                                                <div style={{ fontSize: '0.9rem', color: '#78350f', lineHeight: '1.5' }}>
                                                    {analysis.schoolViolenceScore.judgment.reason}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem', textAlign: 'center' }}>
                                    * 이 분석은 AI의 추론이며, 실제 법적/행정적 판단과 다를 수 있습니다.
                                </p>
                            </div>
                        ) : (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '0.5rem' }}>
                                <span className="material-icons-round" style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '0.5rem', display: 'block' }}>analytics</span>
                                사안 분석 데이터가 존재하지 않습니다.
                            </div>
                        )}
                    </div>
                );

            case 3:
                const strategy = analysis?.interventionStrategy;
                if (!strategy) return (
                    <div className="step-executor">
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                            구체적인 개입 전략 분석 데이터가 없습니다.
                        </div>
                    </div>
                );

                // Backward compatibility
                const immediate = strategy.immediate || strategy.checklist || [];
                const counseling = strategy.counseling || [];
                const classGuide = strategy.class || "";
                const parentGuide = strategy.parents || strategy.parentGuide || "";
                const adminGuide = strategy.admin || "";
                const approach = strategy.approach || ""; // Legacy fallback

                const renderSection = (title, icon, color, content) => {
                    if (!content || (Array.isArray(content) && content.length === 0)) return null;
                    return (
                        <div style={{ marginBottom: '1.2rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                <span className="material-icons-round" style={{ fontSize: '1.1rem', marginRight: '6px', color: color }}>{icon}</span>
                                {title}
                            </div>
                            <div style={{ background: '#fff', padding: '1rem', borderRadius: '0.5rem', border: `1px solid ${color}30`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {Array.isArray(content) ? (
                                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', lineHeight: '1.6' }}>
                                        {content.map((item, i) => {
                                            // Ensure we extract a clean string from any object structure
                                            let safeItem = item;
                                            if (typeof item === 'object' && item !== null) {
                                                safeItem = item.text || item.description || item.content || item.value || '';
                                            }
                                            if (!safeItem) return null; // Skip empty items

                                            return <li key={i} style={{ marginBottom: '0.3rem' }}>{safeItem}</li>;
                                        })}
                                    </ul>
                                ) : (
                                    <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                        {typeof content === 'object' ? (content.text || content.description || '') : content}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                };

                return (
                    <div className="step-executor">
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.8rem', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.8rem' }}>
                                <span className="material-icons-round" style={{ color: '#8b5cf6', marginRight: '0.6rem' }}>psychology</span>
                                학교 현장 맞춤형 대응 방안
                            </h4>

                            {renderSection('긴급 조치 및 초기 대응', 'emergency_share', '#ef4444', immediate)}
                            {renderSection('심층 상담 접근 포인트 (피해/가해)', 'record_voice_over', '#8b5cf6', counseling)}
                            {renderSection('학급 생활지도 (분위기 관리)', 'school', '#3b82f6', classGuide)}
                            {renderSection('보호자 소통 가이드', 'family_restroom', '#10b981', parentGuide)}
                            {renderSection('행정 절차 및 기록', 'assignment', '#64748b', adminGuide)}

                            {/* Fallback legacy */}
                            {!counseling.length && !classGuide && !adminGuide && renderSection('교육적 접근 방향 (기존)', 'lightbulb', '#f59e0b', approach)}
                        </div>
                    </div>
                );

            case 4:
                const fullText = analysis?.neisRecord || analysis?.neis || '';
                const parts = String(fullText).split('[누가기록]');
                const hasWhoRecord = parts.length > 1;
                const neisContent = parts[0].trim();
                const whoContent = hasWhoRecord ? parts[1].trim() : '';

                return (
                    <div className="step-executor" style={{ padding: '0.5rem' }}>
                        {/* 1. NEIS 기록 */}
                        <div className="neis-section icon-card" style={{
                            marginBottom: '1.5rem',
                            background: '#fff',
                            borderRadius: '0.8rem',
                            border: '1px solid #e2e8f0',
                            padding: '1.2rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
                                <label style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                                    <span className="material-icons-round" style={{ marginRight: '0.6rem', color: '#3b82f6' }}>description</span>
                                    나이스(NEIS) 입력용
                                </label>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(neisContent);
                                        alert('나이스(NEIS) 기록이 복사되었습니다.');
                                    }}
                                    className="copy-button"
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
                            <div className="neis-preview" style={{
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                color: '#334155',
                                border: '1px solid #e2e8f0',
                                whiteSpace: 'pre-line'
                            }}>
                                {neisContent || '생성된 기록이 없습니다.'}
                            </div>
                        </div>

                        {/* 2. 누가기록 (있을 경우만) */}
                        {hasWhoRecord && (
                            <div className="who-section icon-card" style={{
                                marginBottom: '1.5rem',
                                background: '#fff',
                                borderRadius: '0.8rem',
                                border: '1px solid #e2e8f0',
                                padding: '1.2rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <label style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                                        <span className="material-icons-round" style={{ marginRight: '0.6rem', color: '#f59e0b' }}>history_edu</span>
                                        누가기록
                                    </label>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(whoContent);
                                            alert('누가기록이 복사되었습니다.');
                                        }}
                                        className="copy-button"
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
                                            fontWeight: '600'
                                        }}
                                    >
                                        <span className="material-icons-round" style={{ fontSize: '1rem', marginRight: '4px' }}>content_copy</span>
                                        복사
                                    </button>
                                </div>
                                <div className="who-preview" style={{
                                    background: '#fffbeb',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    color: '#78350f',
                                    border: '1px solid #fcd34d',
                                    whiteSpace: 'pre-line'
                                }}>
                                    {whoContent.includes('피해 학생:') && whoContent.includes('가해 학생:') ? (
                                        whoContent.split(/(?=\n\s*피해 학생:)/).map((part, index) => (
                                            <p key={index} style={{ margin: index === 0 ? '0 0 1rem 0' : '0' }}>
                                                {part.trim()}
                                            </p>
                                        ))
                                    ) : (
                                        whoContent
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. 학부모 상담 및 학생 지도 자료 생성 (ActionGenerator) */}
                        <div className="action-generator-section section-card" style={{
                            background: '#fff',
                            borderRadius: '0.8rem',
                            border: '1px solid #e2e8f0',
                            padding: '1.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ marginBottom: '1.5rem', fontWeight: '700', color: '#1e293b', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                                <span className="material-icons-round" style={{ marginRight: '0.6rem', color: '#8b5cf6' }}>psychology</span>
                                상담 자료 및 스크립트 생성
                            </div>
                            <ActionGenerator
                                initialText={`[${analysis.incidentType}] ${analysis.who} - ${analysis.what}`}
                                analysisData={analysis}
                            />
                        </div>
                    </div>
                );

            case 5:
                return null;

            default:
                return <p>{step.content}</p>;
        }
    };

    return (
        <div className="guidance-step-executor">
            {renderStepContent()}
        </div>
    );
};

export default GuidanceStepExecutor;

