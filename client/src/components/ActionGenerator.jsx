import React, { useState } from 'react';
import { analysisAPI } from '../services/api';

const ActionGenerator = ({ initialText, analysisData }) => {
    const [activeTab, setActiveTab] = useState('letter'); // 'letter' or 'script'
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    // Letter state
    const [letterParams, setLetterParams] = useState({
        receiver: '가해 학생 학부모',
        tone: '정중하게'
    });

    // Script state
    const [scriptParams, setScriptParams] = useState({
        target: '가해 학생',
        goal: '행동 교정 및 사과 유도'
    });

    const handleGenerate = async () => {
        setLoading(true);
        setResult('');

        // Construct rich text from analysisData if available
        let richText = initialText;
        if (analysisData) {
            richText = `
사건 유형: ${analysisData.incidentType || '미지정'}
관련 학생: ${analysisData.who || '미상'}
발생 일시: ${analysisData.when || '미상'}
발생 장소: ${analysisData.where || '미상'}
행동 요약: ${analysisData.what || '내용 없음'}
발생 경위(How): ${analysisData.how || '미상'}
발생 원인(Why): ${analysisData.why || '미상'}
            `.trim();
        }

        try {
            let response;
            if (activeTab === 'letter') {
                response = await analysisAPI.generateLetter({
                    text: richText,
                    ...letterParams
                });
            } else {
                response = await analysisAPI.generateScript({
                    text: richText,
                    ...scriptParams
                });
            }

            if (response.data.success) {
                setResult(response.data.result);
            }
        } catch (error) {
            console.error('Generation error:', error);
            alert('생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        alert('복사되었습니다.');
    };

    return (
        <div className="action-generator">
            {/* Tabs */}
            <div className="action-tabs">
                <button
                    className={`tab-button ${activeTab === 'letter' ? 'active' : ''}`}
                    onClick={() => setActiveTab('letter')}
                >
                    <span className="material-icons-round">mail</span>
                    학부모 회신
                </button>
                <button
                    className={`tab-button ${activeTab === 'script' ? 'active' : ''}`}
                    onClick={() => setActiveTab('script')}
                >
                    <span className="material-icons-round">description</span>
                    상담 가이드
                </button>
            </div>

            {/* Controls */}
            <div className="action-controls">
                {activeTab === 'letter' ? (
                    <>
                        <div className="control-group">
                            <label>수신자</label>
                            <select
                                value={letterParams.receiver}
                                onChange={(e) => setLetterParams({ ...letterParams, receiver: e.target.value })}
                            >
                                <option>가해 학생 학부모</option>
                                <option>피해 학생 학부모</option>
                            </select>
                        </div>
                        <div className="control-group">
                            <label>어조</label>
                            <select
                                value={letterParams.tone}
                                onChange={(e) => setLetterParams({ ...letterParams, tone: e.target.value })}
                            >
                                <option>정중하게</option>
                                <option>단호하게</option>
                                <option>차분하게</option>
                                <option>협조적으로</option>
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="control-group">
                            <label>대상</label>
                            <select
                                value={scriptParams.target}
                                onChange={(e) => setScriptParams({ ...scriptParams, target: e.target.value })}
                            >
                                <option>가해 학생</option>
                                <option>피해 학생</option>
                            </select>
                        </div>
                        <div className="control-group">
                            <label>목표</label>
                            <select
                                value={scriptParams.goal}
                                onChange={(e) => setScriptParams({ ...scriptParams, goal: e.target.value })}
                            >
                                <option>행동 교정 및 사과 유도</option>
                                <option>심리적 안정 및 위로</option>
                                <option>사실 관계 확인</option>
                                <option>화해 및 관계 회복</option>
                            </select>
                        </div>
                    </>
                )}
                <button onClick={handleGenerate} disabled={loading} className="generate-button">
                    {loading ? '생성 중...' : 'AI 생성하기'}
                </button>
            </div>

            {/* Result */}
            {result && (
                <div className="action-result">
                    <div className="result-header">
                        <h4>생성 결과</h4>
                        <div className="result-actions">
                            <button onClick={handleCopy} className="icon-button">
                                <span className="material-icons-round">content_copy</span>
                            </button>
                        </div>
                    </div>
                    <div className="result-content" style={{ whiteSpace: 'pre-wrap' }}>
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionGenerator;
