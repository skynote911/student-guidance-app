import React, { useState, useRef, useEffect } from 'react';
import { analysisAPI } from '../services/api';

const INCIDENT_TYPES = [
    '또래 갈등',
    '수업 방해',
    '언어 폭력',
    '신체 폭력',
    '물건 절취',
    '거짓말',
    '따돌림',
    '사이버 폭력',
    '성 관련 사안',
    '금품 갈취',
    '기물 파손',
    '지시 불이행',
    '무단 이탈',
    '흡연/음주',
    '기타'
];

const NONVERBAL_ATTITUDES = [
    '눈을 마주치지 않음',
    '고개를 숙임',
    '울먹임',
    '화난 표정',
    '무표정',
    '반항적 태도',
    '다리를 떪',
    '손톱을 물어뜯음',
    '한숨을 쉼',
    '주먹을 꽉 귐',
    '횡설수설함',
    '비웃음',
    '침묵',
    '안절부절못함',
    '목소리가 떨림'
];

const InputArea = ({ onAnalyze, loading }) => {
    // Shared State
    const [text, setText] = useState('');
    const [incidentType, setIncidentType] = useState('');
    const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]); // Default to Today
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processProgress, setProcessProgress] = useState('');

    // Students
    const [students, setStudents] = useState([]);
    const [studentId, setStudentId] = useState([]); // Selected Student IDs

    // Individual State: { [studentId]: { audioBlob: null, note: '', attitudes: [], anger: 0 } }
    const [individualData, setIndividualData] = useState({});

    const [recordingState, setRecordingState] = useState({
        activeStudentId: null, // 'general' or specific studentId
        isRecording: false
    });

    // Ref to track recording intent synchronously (avoids race conditions with state updates)
    const isRecordingRef = useRef(false);
    const activeTargetRef = useRef(null); // Tracks 'general' or studentId synchronously

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await analysisAPI.getStudents();
                if (response.data && response.data.students) {
                    setStudents(response.data.students);
                }
            } catch (error) {
                console.error('Failed to fetch students:', error);
            }
        };
        fetchStudents();
    }, []);

    // Refs for accessing latest state inside event listeners
    const stateRef = useRef({
        recordingState: { activeStudentId: null, isRecording: false },
        individualData,
        setText,
        setIndividualData
    });
    const interimText = useRef(''); // Use Ref for interim to avoid re-renders or display state
    const [displayInterim, setDisplayInterim] = useState(''); // State for visual feedback

    // Update ref on every render
    useEffect(() => {
        stateRef.current = {
            recordingState,
            individualData,
            setText,
            setIndividualData
        };
    }, [recordingState, individualData]);

    const recognitionInstance = useRef(null);

    // Helper to update individual data
    const handleIndividualChange = (id, field, value) => {
        setIndividualData(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] || { audioBlob: null, note: '', attitudes: [], anger: 0 }),
                [field]: value
            }
        }));
    };

    const toggleIndividualAttitude = (id, attitude) => {
        const currentAttitudes = individualData[id]?.attitudes || [];
        const newAttitudes = currentAttitudes.includes(attitude)
            ? currentAttitudes.filter(a => a !== attitude)
            : [...currentAttitudes, attitude];
        handleIndividualChange(id, 'attitudes', newAttitudes);
    };

    // Lock to prevent double-start
    const isStartingRef = useRef(false);

    // Recording Logic
    const startRecording = async (targetId) => {
        if (isStartingRef.current || isRecordingRef.current) return;
        isStartingRef.current = true;

        try {
            if (!('webkitSpeechRecognition' in window)) {
                alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.');
                return;
            }

            // Set intent immediately
            activeTargetRef.current = targetId;

            // 1. Start Audio Recording (MediaRecorder)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                // Use the ref to ensure we know the target even if state is stale
                const target = activeTargetRef.current;
                if (target && target !== 'general') {
                    handleIndividualChange(target, 'audioBlob', audioBlob);
                }
            };

            mediaRecorder.start();

            // 2. Start Speech Recognition (Fresh Instance)
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'ko-KR';

            recognition.onresult = (event) => {
                const { setText, setIndividualData } = stateRef.current;
                const activeTarget = activeTargetRef.current;

                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                // Update UI with interim
                setDisplayInterim(interimTranscript);

                if (finalTranscript) {
                    // Commit Final
                    console.log(`STT Final (${activeTarget}):`, finalTranscript);

                    if (activeTarget === 'general') {
                        setText(prev => prev + (prev ? ' ' : '') + finalTranscript);
                    } else if (activeTarget) {
                        setIndividualData(prev => ({
                            ...prev,
                            [activeTarget]: {
                                ...(prev[activeTarget] || { audioBlob: null, note: '', attitudes: [], anger: 0 }),
                                note: (prev[activeTarget]?.note || '') + (finalTranscript ? ' ' + finalTranscript : '')
                            }
                        }));
                    }
                    setDisplayInterim(''); // Clear interim after commit
                }
            };

            recognition.onend = () => {
                if (isRecordingRef.current) {
                    console.log('STT restarted automatically...');
                    try { recognition.start(); } catch (e) { }
                }
            };

            recognition.onerror = (event) => {
                console.warn('STT Error:', event.error);
                if (event.error === 'not-allowed') {
                    alert('마이크 접근이 차단되었습니다.');
                    stopRecording();
                }
            };

            recognitionInstance.current = recognition;
            recognition.start();

            // Sync Updates
            isRecordingRef.current = true;
            setRecordingState({ activeStudentId: targetId, isRecording: true });

        } catch (error) {
            console.error('Recording error:', error);
            alert('마이크 접근 권한이 필요합니다.');
            activeTargetRef.current = null;
        } finally {
            isStartingRef.current = false;
        }
    };

    const stopRecording = () => {
        isRecordingRef.current = false; // Stop intent
        activeTargetRef.current = null;
        isStartingRef.current = false; // Reset lock if stuck

        // Stop Audio Recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        // Stop STT
        if (recognitionInstance.current) {
            recognitionInstance.current.stop();
            recognitionInstance.current = null;
        }

        setRecordingState({ activeStudentId: null, isRecording: false });
        setDisplayInterim('');
    };

    const handleFileAttach = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            const response = await analysisAPI.uploadFiles(formData);
            if (response.data.success) {
                setAttachedFiles(prev => [...prev, ...response.data.files]);
            }
        } catch (error) {
            console.error('File upload error:', error);
            alert(`파일 업로드 실패: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleRemoveFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (studentId.length === 0) {
            alert('학생을 최소 한 명 이상 선택해주세요.');
            return;
        }

        if (!text.trim() && attachedFiles.length === 0) {
            const hasIndividualContent = studentId.some(sid =>
                individualData[sid]?.note || individualData[sid]?.audioBlob
            );
            if (!hasIndividualContent) {
                alert('사건 내용(공통/개별)을 입력하거나 파일을 첨부해주세요.');
                return;
            }
        }

        setIsProcessing(true);
        const involvedStudentsList = students
            .filter(s => studentId.includes(s.studentId))
            .map(s => ({ id: s.studentId, name: s.name }));

        try {
            // Sequential Submission
            for (let i = 0; i < studentId.length; i++) {
                const sid = studentId[i];
                const currentStudentName = students.find(s => s.studentId === sid)?.name || sid;
                setProcessProgress(`${i + 1} / ${studentId.length}명 (${currentStudentName})`);

                const data = individualData[sid] || { audioBlob: null, note: '', attitudes: [], anger: 0 };

                // Construct Context
                // Add Date explicitly to the context
                let fullText = `[발생 일시]: ${incidentDate}\n[공통 정황]: ${text}`;
                if (data.note) fullText += `\n\n[개별 진술/관찰]: ${data.note}`;
                if (data.attitudes.length > 0) fullText += `\n\n[비언어적 태도]: ${data.attitudes.join(', ')}`;
                if (data.anger > 0) fullText += `\n[분노/흥분 척도]: ${data.anger}/10`;
                if (attachedFiles.length > 0) fullText += `\n[첨부파일]: ${attachedFiles.map(f => f.originalname).join(', ')}`;

                // Upload Individual Audio
                let audioPath = null;
                if (data.audioBlob) {
                    try {
                        const audioFormData = new FormData();
                        audioFormData.append('files', data.audioBlob, `recording_${sid}.webm`);
                        const uploadRes = await analysisAPI.uploadFiles(audioFormData);
                        if (uploadRes.data.success && uploadRes.data.files.length > 0) {
                            audioPath = uploadRes.data.files[0].path;
                        }
                    } catch (err) {
                        console.error('Audio upload failed for', sid, err);
                    }
                }

                // Submit Analysis
                await onAnalyze({
                    text: fullText,
                    studentId: sid,
                    involvedStudents: involvedStudentsList,
                    incidentType: incidentType || '기타',
                    attachedFiles: attachedFiles,
                    audioPath: audioPath
                });

                // Prevent Rate Limit (Add 10s delay between requests to be safe)
                if (i < studentId.length - 1) {
                    setProcessProgress(`대기 중 (${i + 1}/${studentId.length} 완료)... 안전한 분석을 위해 잠시 기다려주세요.`);
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
            }

            // Reset Logic Removed - Persist Data
            alert('모든 분석이 완료되었습니다. (입력 내용은 유지됩니다)');

        } catch (error) {
            console.error('Batch processing error:', error);
            alert('처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
            setProcessProgress('');
        }
    };

    const handleReset = () => {
        if (!window.confirm('입력된 모든 내용을 초기화하시겠습니까?')) return;

        setText('');
        setStudentId([]);
        setIncidentType('');
        setIncidentDate(new Date().toISOString().split('T')[0]); // Reset to today
        setAttachedFiles([]);
        setIndividualData({});
        setRecordingState({ activeStudentId: null, isRecording: false });
    };

    return (
        <div className="input-area">
            <form onSubmit={handleSubmit} className="input-form">
                {/* 1. Shared Configuration */}
                <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="material-icons-round" style={{ color: '#3b82f6' }}>info</span>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>1. 공통 상황 입력</h3>
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={loading || isProcessing}
                            style={{
                                background: 'none',
                                border: '1px solid #cbd5e1',
                                color: '#64748b',
                                padding: '0.3rem 0.7rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                        >
                            <span className="material-icons-round" style={{ fontSize: '1rem' }}>refresh</span>
                            입력 초기화
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Date Picker */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>발생 일자</label>
                                <input
                                    type="date"
                                    value={incidentDate}
                                    onChange={(e) => setIncidentDate(e.target.value)}
                                    className="form-input"
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                                />
                            </div>

                            {/* Incident Type */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>사건 유형</label>
                                <select
                                    value={incidentType}
                                    onChange={(e) => setIncidentType(e.target.value)}
                                    className="form-select"
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="">선택하세요</option>
                                    {INCIDENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Evidence Upload */}
                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>증거 자료</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,audio/*,video/*,application/pdf"
                                multiple
                                onChange={handleFileAttach}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="attach-button"
                                style={{
                                    width: '100%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.6rem',
                                    background: 'white',
                                    color: '#64748b',
                                    border: '1px dashed #cbd5e1',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span className="material-icons-round" style={{ fontSize: '1.2rem' }}>add_photo_alternate</span>
                                파일 첨부하기
                            </button>
                            <div style={{ marginTop: '0.5rem' }}>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>
                                    지원: 이미지, 오디오, 비디오, PDF
                                </p>
                                {attachedFiles.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        {attachedFiles.map((file, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                background: '#eff6ff',
                                                padding: '0.4rem 0.6rem',
                                                borderRadius: '0.3rem',
                                                fontSize: '0.8rem',
                                                color: '#1e40af',
                                                border: '1px solid #bfdbfe'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                                                    <span className="material-icons-round" style={{ fontSize: '1rem' }}>
                                                        {file.mimetype.startsWith('image') ? 'image' :
                                                            file.mimetype.startsWith('audio') ? 'audiotrack' :
                                                                file.mimetype.startsWith('video') ? 'videocam' : 'description'}
                                                    </span>
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                                        {file.originalname}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(idx)}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#93c5fd', padding: 0, display: 'flex' }}
                                                >
                                                    <span className="material-icons-round" style={{ fontSize: '1rem' }}>close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>
                            전체 상황 설명 <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.8rem' }}>(모든 학생에게 공통 적용)</span>
                        </label>
                        <div className="textarea-wrapper" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: '0.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="예: 급식실 줄을 서던 중 서로 밀치며 다툼이 시작됨..."
                                    className="form-textarea"
                                    rows={3}
                                />
                                {recordingState.activeStudentId === 'general' && displayInterim && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        left: '12px',
                                        right: '12px',
                                        color: '#94a3b8',
                                        fontSize: '0.95rem',
                                        pointerEvents: 'none',
                                        background: 'rgba(255,255,255,0.9)',
                                        fontStyle: 'italic'
                                    }}>
                                        ... {displayInterim}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => recordingState.isRecording ? stopRecording() : startRecording('general')}
                                className={`voice-input-btn ${recordingState.activeStudentId === 'general' && recordingState.isRecording ? 'recording' : ''}`}
                                style={{
                                    fontSize: '0.85rem',
                                    padding: '0.4rem 0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    borderRadius: '0.4rem',
                                    border: recordingState.activeStudentId === 'general' && recordingState.isRecording ? '1px solid #fecaca' : '1px solid #e2e8f0',
                                    background: recordingState.activeStudentId === 'general' && recordingState.isRecording ? '#fee2e2' : '#eff6ff',
                                    color: recordingState.activeStudentId === 'general' && recordingState.isRecording ? '#ef4444' : '#2563eb',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span className="material-icons-round" style={{ fontSize: '1.1rem' }}>{recordingState.activeStudentId === 'general' && recordingState.isRecording ? 'stop' : 'mic'}</span>
                                {recordingState.activeStudentId === 'general' && recordingState.isRecording ? '녹음 중지' : '음성 입력'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Student Selection */}
                <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#1e293b' }}>2. 학생 선택</h3>
                    <div className="student-select-container">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {students.filter(s => studentId.includes(s.studentId)).map(s => (
                                <span key={s.studentId} style={{ background: '#3b82f6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {s.name}
                                    <button
                                        type="button"
                                        onClick={() => setStudentId(prev => prev.filter(id => id !== s.studentId))}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}
                                    >✕</button>
                                </span>
                            ))}
                        </div>
                        <select
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                if (!studentId.includes(val)) setStudentId(prev => [...prev, val]);
                            }}
                            className="form-select"
                            value=""
                        >
                            <option value="">+ 학생 추가</option>
                            {students.map(s => (
                                <option key={s.studentId} value={s.studentId} disabled={studentId.includes(s.studentId)}>
                                    {s.name} ({s.studentId})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3. Individual Inputs */}
                {studentId.length > 0 && (
                    <div style={{ padding: '1.5rem', background: '#fff' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#1e293b' }}>3. 개별 진술 및 태도 (학생별 입력)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {studentId.map(sid => {
                                const student = students.find(s => s.studentId === sid);
                                const data = individualData[sid] || { note: '', attitudes: [], anger: 0 };
                                const isRec = recordingState.activeStudentId === sid && recordingState.isRecording;

                                return (
                                    <div key={sid} style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                        <div style={{ padding: '0.75rem 1rem', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>{student?.name}</span>
                                            {data.audioBlob && <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="material-icons-round" style={{ fontSize: '1rem' }}>mic</span>녹음됨</span>}
                                        </div>
                                        <div style={{ padding: '1rem' }}>
                                            {/* Voice/Text Input */}
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div className="textarea-wrapper" style={{ minHeight: '80px', marginBottom: '0.5rem' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <textarea
                                                            value={data.note}
                                                            onChange={(e) => handleIndividualChange(sid, 'note', e.target.value)}
                                                            placeholder={`${student?.name}의 진술이나 관찰 내용을 입력하세요.`}
                                                            className="form-textarea"
                                                            rows={2}
                                                            style={{ fontSize: '0.9rem' }}
                                                        />
                                                        {recordingState.activeStudentId === sid && displayInterim && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: '8px',
                                                                left: '10px',
                                                                right: '10px',
                                                                color: '#94a3b8',
                                                                fontSize: '0.85rem',
                                                                pointerEvents: 'none',
                                                                background: 'rgba(255,255,255,0.9)',
                                                                fontStyle: 'italic'
                                                            }}>
                                                                ... {displayInterim}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => isRec ? stopRecording() : startRecording(sid)}
                                                        className={`voice-input-btn ${isRec ? 'recording' : ''}`}
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            padding: '0.3rem 0.6rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.3rem',
                                                            borderRadius: '0.3rem',
                                                            border: isRec ? '1px solid #fecaca' : '1px solid #bfdbfe',
                                                            background: isRec ? '#fee2e2' : '#eff6ff',
                                                            color: isRec ? '#ef4444' : '#2563eb',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <span className="material-icons-round" style={{ fontSize: '1rem' }}>{isRec ? 'stop' : 'mic'}</span>
                                                        {isRec ? '중지' : '개별녹음'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Attitudes */}
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>비언어적 태도</label>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {NONVERBAL_ATTITUDES.map(att => (
                                                        <label key={att} style={{
                                                            display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem',
                                                            padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
                                                            background: data.attitudes?.includes(att) ? '#eff6ff' : '#f8fafc',
                                                            color: data.attitudes?.includes(att) ? '#2563eb' : '#64748b',
                                                            border: data.attitudes?.includes(att) ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                                            cursor: 'pointer'
                                                        }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={data.attitudes?.includes(att) || false}
                                                                onChange={() => toggleIndividualAttitude(sid, att)}
                                                                style={{ display: 'none' }}
                                                            />
                                                            {att}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Anger */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                                    <span style={{ color: '#64748b' }}>흥분/분노 정도</span>
                                                    <span style={{ fontWeight: 'bold', color: data.anger > 5 ? '#ef4444' : '#3b82f6' }}>{data.anger || 0} / 10</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    value={data.anger || 0}
                                                    onChange={(e) => handleIndividualChange(sid, 'anger', parseInt(e.target.value))}
                                                    style={{ width: '100%', accentColor: data.anger > 5 ? '#ef4444' : '#3b82f6', height: '4px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <button type="submit" className="submit-button" disabled={loading || isProcessing} style={{ width: '100%', background: isProcessing ? '#94a3b8' : '' }}>
                        {isProcessing ? (
                            <><span className="material-icons-round spinning">autorenew</span>분석 진행 중: {processProgress}</>
                        ) : loading ? (
                            <><span className="material-icons-round spinning">autorenew</span>분석 준비 중...</>
                        ) : (
                            <><span className="material-icons-round">auto_awesome</span>AI 분석 시작 (검사: {studentId.length}명)</>
                        )}
                    </button>
                </div>
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f1f5f9', borderRadius: '0.25rem', fontSize: '0.8rem', color: '#475569' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>판단 기준 가이드:</div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <li><b>0-2 (평온/안정)</b>: 차분한 목소리, 눈맞춤 유지, 안정된 자세</li>
                        <li><b>3-5 (불만/긴장)</b>: 목소리가 커짐, 미간 찌푸림, 한숨, 안절부절</li>
                        <li><b>6-8 (흥분/분노)</b>: 소리 지름, 삿대질, 떨림, 공격적 언어</li>
                        <li><b>9-10 (폭발/위협)</b>: 통제 불능, 물건 투척 시도, 신체적 위협</li>
                    </ul>
                </div>
            </form>
        </div>
    );
};

export default InputArea;
