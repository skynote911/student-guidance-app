import express from 'express';
import mongoose from 'mongoose';
import Incident from '../models/Incident.js';
import { authenticate } from '../middleware/auth.js';
import { selectGuidanceTemplate, generateNeisRecord } from '../utils/guidanceTemplates.js';

const router = express.Router();

/**
 * Analyze input using Gemini API
 */
import { PROMPTS } from '../utils/prompts.js';

/**
 * Call Gemini API with a specific prompt
 */
import fs from 'fs';
import path from 'path';

/**
 * Call Gemini API with a specific prompt (supports multimodal)
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGemini(parts, retries = 5, responseMimeType = "application/json") {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const contentsParts = Array.isArray(parts) ? parts : [{ text: parts }];

    for (let i = 0; i <= retries; i++) {
        try {
            // Fallback strategy: Try gemini-2.0-flash (Fast) first, then gemini-pro-latest (Robust)
            // Attempts 0-1: gemini-2.0-flash
            // Attempts 2-5: gemini-pro-latest
            const model = i < 2 ? 'gemini-2.0-flash' : 'gemini-pro-latest';

            // Configure generation options
            const generationConfig = {};
            if (responseMimeType) {
                generationConfig.responseMimeType = responseMimeType;
            }

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: contentsParts }],
                        generationConfig: generationConfig
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                    return data.candidates[0].content.parts[0].text;
                }
                // Safety filter or empty response logic... (same as before)
                console.warn("⚠️ Gemini returned 200 but no content:", JSON.stringify(data));
                return "{\"error\": \"blocked_by_safety_filter\", \"incidentType\": \"기타\", \"guidance\": \"AI가 답변을 생성하지 못했습니다.\", \"neis\": \"분석 불가\"}";
            }
            // ... (rest of callGemini)

            // In analyzeWithGemini:
            const textResponse = await callGemini(parts);

            // Robust JSON Extraction
            let jsonStr = textResponse;
            // 1. Try to find JSON block between { and }
            const match = textResponse.match(/\{[\s\S]*\}/);
            if (match) {
                jsonStr = match[0];
            }

            // 2. Remove any lingering markdown just in case
            jsonStr = jsonStr.replace(/```json|```/g, "").trim();

            let analysis;
            try {
                analysis = JSON.parse(jsonStr);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                console.error("Raw Text:", textResponse);
                throw new Error("AI 응답을 분석할 수 없습니다. (JSON 파싱 실패)");
            }

            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                    return data.candidates[0].content.parts[0].text;
                }
                // Safety filter or empty response
                console.warn("⚠️ Gemini returned 200 but no content (Safety Filter?):", JSON.stringify(data));
                return "{\"error\": \"blocked_by_safety_filter\", \"incidentType\": \"기타\", \"guidance\": \"AI가 콘텐츠 안전 정책에 따라 답변을 생성하지 못했습니다.\", \"neis\": \"AI 분석 불가 (안전 정책)\"}";
            }

            // Read text for detection
            const errorBody = await response.text();

            // Check for Rate Limit (429), Server Error (503), or Quota Error (403)
            const isRateLimit = response.status === 429 ||
                response.status === 503 ||
                (response.status === 403 && (errorBody.includes('quota') || errorBody.includes('limit')));

            if (isRateLimit && i < retries) {
                const waitTime = 2000 * Math.pow(2, i);
                console.warn(`⚠️ API Error (${response.status}: ${model}). Retrying with fallback in ${waitTime / 1000}s... (Attempt ${i + 1}/${retries})`);
                await sleep(waitTime);
                continue;
            }

            // If other error or out of retries
            const errorMessage = `Gemini API Error: ${response.status} ${response.statusText}\n${errorBody}`;
            console.error(errorMessage);

            // Log to debug.log
            try {
                fs.appendFileSync(path.join(process.cwd(), 'debug.log'), `${new Date().toISOString()} - ${errorMessage}\n\n`);
            } catch (e) {
                console.error('Failed to write to debug.log', e);
            }

            const errorObj = new Error('Gemini API request failed');
            errorObj.status = response.status;
            errorObj.details = errorBody; // Add details to error object
            throw errorObj;

        } catch (error) {
            // Check if it's the error we just threw
            if (error.message === 'Gemini API request failed') throw error;

            // If network error, maybe retry?
            if (i < retries) {
                console.warn(`⚠️ Network error. Retrying... (${error.message})`);
                await sleep(2000);
                continue;
            }
            throw error;
        }
    }
}

/**
 * Analyze input using Gemini API (Default Analysis)
 */
async function analyzeWithGemini(text, schoolLevel = 'all', audioPath = null, involvedStudents = [], attachedFiles = []) {
    const schoolLevelText = {
        'elementary': '초등학교',
        'middle': '중학교',
        'high': '고등학교',
        'all': '초등학교, 중학교, 고등학교 모든 학교급'
    }[schoolLevel] || '초등학교, 중학교, 고등학교 모든 학교급';

    const participantsInfo = involvedStudents.length > 0
        ? `참여자: 선생님, 학생들(${involvedStudents.map(s => s.name).join(', ')})`
        : '참여자: 선생님, 학생';

    const systemPrompt = `
    너는 학교 생활지도 전문가야. ${schoolLevelText}의 생활지도를 지원할 수 있어야 해. 
    제공된 텍스트, 오디오, 이미지(증거 자료 등)를 종합적으로 분석해서 사건을 파악해줘.
    ${participantsInfo}
    특히 목소리의 톤, 감정, 속도, 망설임, 그리고 이미지 속 상황을 분석하여 객관적인 상황을 유추해줘.
    
    입력 내용: "${text}"

    요구사항:
    1. 5W1H(누가, 언제, 어디서, 무엇을, 어떻게, 왜)를 분석해.
       - '누가'는 가해/피해 학생을 명확히 구분하여 **단일 문자열**로 작성해.
       - **절대 JSON 객체로 중첩하지 말고, 모든 필드는 문자열(String)이어야 해.**
       - '무엇을'은 구체적인 행동을 요약해.
       - **정보가 부족하거나 확실하지 않은 항목은 추측하지 말고 반드시 "미확인"이라고 적어.**
    2. 'guidance' 필드에 교사가 취해야 할 생활지도 가이드를 HTML 태그(<br>, <strong> 등)를 사용하여 3단계로 작성해.
    3. 'neis' 필드에 학교생활기록부(나이스) 또는 상담일지에 입력할 격식 있고 객관적인 문구를 작성해. (~함, ~임 체 사용)
    4. 'incidentType' 필드에 사건 유형을 분류해 (예: '또래 갈등', '수업 방해', '언어 폭력', '신체 폭력')
    5. 'riskLevel' 필드에 자해/자살 또는 심각한 폭력 위험도를 'Low', 'Medium', 'High' 중 하나로 분류해.
    6. 'riskReason' 필드에 위험도 판단 근거를 간략히 적어.
    7. 'detectedNonVerbal' 필드에 오디오/이미지 분석을 통해 감지된 비언어적 태도(예: 떨리는 목소리, 울먹임, 낙서, 상처 등)를 문자열로 적어. (정보가 없으면 "해당 없음")
    8. 'schoolViolenceScore' 필드에 학교폭력 4대 요소를 분석하여 객체로 작성해. **입력된 사안의 구체적인 사실관계를 근거로 분석해야 해**:
       - 'intentionality' (고의성): { "score": "상/중/하", "reason": "구체적인 이유 (예: 지속적인 괴롭힘 의도가 명확함)" }
       - 'severity' (심각성): { "score": "상/중/하", "reason": "구체적인 이유 (예: 전치 2주의 상해 발생)" }
       - 'continuity' (지속성): { "score": "상/중/하", "reason": "구체적인 이유 (예: 2개월간 지속됨)" }
       - 'repentance' (반성정도): { "score": "상/중/하", "reason": "구체적인 이유 (예: 잘못을 인정하고 사과함)" }
       - 'judgment': {
            "decision": "긴급 조치 필요" 또는 "일반 지도",
            "reason": "판단 근거 (4대 요소 분석 결과 종합)",
            "criteria": "적용된 판단 기준 (예: '지속적인 신체 폭력 및 고의성 높음으로 인한 분리 조치 요건 충족')"
         }
    9. 'interventionStrategy' 필드에 **학교 현장에서 실천 가능한 구체적이고 현실적인 대응 방안**을 객체로 작성해:
       - 'immediate': ["피해 학생 심리적 안정 지원(보건실 이동 등)", "가해 학생 분리 및 진술서 작성"] (사안 인지 즉시 취해야 할 긴급 조치 2~3가지)
       - 'counseling': ["(피해자) 공감적 경청을 통해 신뢰 형성", "(가해자) 방어기제 해체 및 행동의 영향 인지 유도"] (학생 상담 시 핵심 접근 포인트)
       - 'class': "학급 분위기 차분하게 유지, 추측성 소문 확산 방지 교육 실시" (학급 전체에 대한 생활지도 방안)
       - 'parents': "객관적 사실 위주 전달, 과도한 방어/비난 자제 요청 멘트 준비" (보호자 상담 시 화법 및 주의사항)
       - 'admin': "사안 접수 대장 기록, 학교전담경찰관(SPO) 자문 필요 여부 검토" (행정/절차적 조치)
    
    출력 포맷(JSON):
    {
        "who": "가해 학생, 피해 학생 이름",
        "when": "YYYY년 MM월 DD일 시간",
        "where": "장소",
        "what": "행동 요약",
        "how": "방법",
        "why": "이유",
        "incidentType": "유형",
        "guidance": "...",
        "neis": "...",
        "riskLevel": "Low",
        "riskReason": "...",
        "detectedNonVerbal": "...",
        "schoolViolenceScore": {
            "intentionality": { "score": "상", "reason": "..." },
            "severity": { "score": "중", "reason": "..." },
            "continuity": { "score": "하", "reason": "..." },
            "repentance": { "score": "중", "reason": "..." },
            "judgment": {
                "decision": "...",
                "reason": "...",
                "criteria": "..."
            }
        },
        "interventionStrategy": {
            "immediate": ["..."],
            "counseling": ["..."],
            "class": "...",
            "parents": "...",
            "admin": "..."
        }
    }
    JSON만 출력하고 다른 말은 하지 마.
    `;

    let parts = [{ text: systemPrompt }];

    // Audio Processing
    if (audioPath) {
        try {
            const fullPath = path.resolve(audioPath);
            const audioData = fs.readFileSync(fullPath);
            const base64Audio = audioData.toString('base64');
            parts.push({
                inlineData: {
                    mimeType: 'audio/webm',
                    data: base64Audio
                }
            });
        } catch (error) {
            console.error('Error reading audio file:', error);
            parts[0].text += "\n\n[오디오 파일 처리 실패: 텍스트만으로 분석합니다]";
        }
    }

    // Image Processing (Attached Files)
    if (attachedFiles && attachedFiles.length > 0) {
        for (const file of attachedFiles) {
            try {
                // Ensure we handle both images and other supported formats
                // Gemini supports JPEG, PNG, WEBP, HEIC, HEIF
                if (file.mimetype.startsWith('image/')) {
                    const fullPath = path.join(process.cwd(), 'uploads', file.filename);
                    const fileData = fs.readFileSync(fullPath);
                    const base64Image = fileData.toString('base64');

                    parts.push({
                        inlineData: {
                            mimeType: file.mimetype,
                            data: base64Image
                        }
                    });
                    parts[0].text += `\n[첨부 이미지: ${file.originalname}]`;
                } else {
                    parts[0].text += `\n[첨부 파일(${file.mimetype}): ${file.originalname} - 지원되지 않는 형식일 수 있음]`;
                }
            } catch (err) {
                console.error('Error processing attached image:', err);
                parts[0].text += `\n[첨부 파일 처리 실패: ${file.originalname}]`;
            }
        }
    }

    const textResponse = await callGemini(parts);

    // Robust JSON Extraction
    let jsonStr = textResponse;
    // 1. Try to find JSON block between { and }
    const match = textResponse.match(/\{[\s\S]*\}/);
    if (match) {
        jsonStr = match[0];
    }

    // 2. Remove any lingering markdown just in case (though match should handle it)
    jsonStr = jsonStr.replace(/```json|```/g, "").trim();

    let analysis;
    try {
        analysis = JSON.parse(jsonStr);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw Text:", textResponse);
        // Return a safe fallback instead of crashing
        analysis = {
            incidentType: '기타',
            guidance: 'AI 분석 보류 (응답 형식 오류)',
            neis: 'AI 분석 결과가 올바르지 않아 기록을 생성하지 못했습니다.',
            riskLevel: 'Low',
            riskReason: '분석 오류',
            detectedNonVerbal: '해당 없음'
        };
    }

    // Mock Emergency Alert for High Risk
    if (analysis.riskLevel === 'High') {
        console.log(`[EMERGENCY ALERT] High risk incident detected! Sending alert to admin...`);
        console.log(`Reason: ${analysis.riskReason}`);
        // In a real app, we would send SMS/Email here
        analysis.alertSent = true;
    }

    return analysis;
}

/**
 * POST /api/analyze
 * Analyze student behavior and optionally save to database
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { text, studentId, saveToDb = true, audioPath, involvedStudents = [], attachedFiles = [] } = req.body;

        // Allow empty text if audio or images are provided
        if (!text && !audioPath && attachedFiles.length === 0) {
            return res.status(400).json({
                error: true,
                message: '분석할 내용을 입력하거나 파일을 첨부해주세요.'
            });
        }

        // Analyze with Gemini (use teacher's schoolLevel if available)
        const schoolLevel = req.teacher?.schoolLevel || 'all';
        const analysis = await analyzeWithGemini(text || '', schoolLevel, audioPath, involvedStudents, attachedFiles);

        // Select guidance template and generate NEIS record (use teacher's schoolLevel)
        const template = selectGuidanceTemplate(analysis, schoolLevel);
        analysis.guidanceSteps = template.steps;

        // Use template-based NEIS record if available, otherwise keep AI's version
        analysis.neisRecord = generateNeisRecord(analysis, template);

        // Save to database if requested and DB is connected
        let incident = null;
        if (saveToDb) {
            if (mongoose.connection.readyState === 1) {
                incident = new Incident({
                    studentId: studentId || 'unknown',
                    involvedStudentIds: involvedStudents.map(s => s.id), // Save multiple IDs
                    incidentType: analysis.incidentType || '기타',
                    rawData: text,  // Will be encrypted by pre-save hook
                    aiAnalysis: analysis,
                    teacherNote: analysis.neisRecord || analysis.neis,  // Prefer template record
                    teacherId: req.teacherId,
                    isEncrypted: true
                });

                await incident.save();
            } else {
                console.log('⚠️  Database disconnected. Skipping DB save.');
                // Create a mock incident object for the response
                incident = {
                    _id: 'mock_incident_' + Date.now(),
                    ...analysis
                };
            }
        }

        res.json({
            success: true,
            analysis,
            incidentId: incident ? incident._id : null,
            saved: saveToDb
        });

    } catch (error) {
        console.error('Analysis error:', error);

        if (error.status === 429) {
            return res.status(429).json({
                error: true,
                message: 'AI 분석 요청이 너무 많습니다. 잠시 후 다시 시도해주세요. (무료 사용량 초과)',
                details: error.details
            });
        }

        res.status(500).json({
            error: true,
            message: '분석 중 오류가 발생했습니다.',
            details: error.message
        });
    }
});

/**
 * GET /api/analyze/incidents
 * Get all incidents for the authenticated teacher
 */
router.get('/incidents', authenticate, async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json({
                success: true,
                incidents: []
            });
        }

        const incidents = await Incident.find({ teacherId: req.teacherId })
            .sort({ incidentDate: -1 })
            .limit(100);

        // Decrypt sensitive fields
        const decryptedIncidents = incidents.map(incident => incident.decryptFields());

        res.json({
            success: true,
            incidents: decryptedIncidents
        });

    } catch (error) {
        console.error('Get incidents error:', error);
        res.status(500).json({
            error: true,
            message: '기록 조회 중 오류가 발생했습니다.'
        });
    }
});

/**
 * GET /api/analyze/incidents/:id
 * Get a specific incident by ID
 */
router.get('/incidents/:id', authenticate, async (req, res) => {
    try {
        const incident = await Incident.findOne({
            _id: req.params.id,
            teacherId: req.teacherId  // Ensure teacher can only access their own incidents
        });

        if (!incident) {
            return res.status(404).json({
                error: true,
                message: '해당 기록을 찾을 수 없습니다.'
            });
        }

        // Decrypt sensitive fields
        const decrypted = incident.decryptFields();

        res.json({
            success: true,
            incident: decrypted
        });

    } catch (error) {
        console.error('Get incident error:', error);
        res.status(500).json({
            error: true,
            message: '기록 조회 중 오류가 발생했습니다.'
        });
    }
});

/**
 * GET /api/analyze/student/:studentId
 * Get all incidents for a specific student (누가기록 조회)
 */
router.get('/student/:studentId', authenticate, async (req, res) => {
    try {
        const { studentId } = req.params;
        console.log(`[DEBUG] Fetching history for studentId: ${studentId}, TeacherId: ${req.teacherId}`);

        // Find all incidents for this student by this teacher (Primary or Involved)
        const incidents = await Incident.find({
            studentId: studentId,
            teacherId: req.teacherId
        })
            .sort({ incidentDate: -1 })
            .limit(100);

        if (incidents.length === 0) {
            return res.json({
                success: true,
                incidents: [],
                count: 0,
                message: '해당 학생의 기록이 없습니다.'
            });
        }

        // Decrypt all incidents
        const decryptedIncidents = incidents.map(incident => incident.decryptFields());

        res.json({
            success: true,
            incidents: decryptedIncidents,
            count: incidents.length,
            studentId: studentId
        });

    } catch (error) {
        console.error('Get student incidents error:', error);
        res.status(500).json({
            error: true,
            message: '학생 기록 조회 중 오류가 발생했습니다.'
        });
    }
});

/**
 * Analyze patterns in student behavior
 */
function analyzePatterns(incidents, currentIncident) {
    const patterns = {
        bySubject: {},
        byTime: {},
        byLocation: {},
        byDayOfWeek: {},
        byIncidentType: {}
    };

    // Count occurrences
    incidents.forEach(incident => {
        const analysis = incident.aiAnalysis || {};

        // Extract subject from 'when' or 'what' field
        const when = analysis.when || '';
        const what = analysis.what || '';
        const where = analysis.where || '';
        const incidentType = incident.incidentType || '기타';

        // Subject pattern (수학, 국어, 영어, etc.)
        const subjects = ['수학', '국어', '영어', '과학', '사회', '체육', '음악', '미술'];
        subjects.forEach(subject => {
            if (when.includes(subject) || what.includes(subject)) {
                patterns.bySubject[subject] = (patterns.bySubject[subject] || 0) + 1;
            }
        });

        // Time pattern (아침, 점심, 쉬는시간, 수업시간, etc.)
        const times = ['아침', '점심', '쉬는시간', '수업시간', '방과후'];
        times.forEach(time => {
            if (when.includes(time)) {
                patterns.byTime[time] = (patterns.byTime[time] || 0) + 1;
            }
        });

        // Location pattern
        if (where && where !== '미확인') {
            patterns.byLocation[where] = (patterns.byLocation[where] || 0) + 1;
        }

        // Day of week pattern
        const date = new Date(incident.incidentDate);
        const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const dayName = dayNames[date.getDay()];
        patterns.byDayOfWeek[dayName] = (patterns.byDayOfWeek[dayName] || 0) + 1;

        // Incident type pattern
        patterns.byIncidentType[incidentType] = (patterns.byIncidentType[incidentType] || 0) + 1;
    });

    // Generate pattern insights
    const insights = [];

    // Subject patterns
    const subjectEntries = Object.entries(patterns.bySubject).sort((a, b) => b[1] - a[1]);
    if (subjectEntries.length > 0 && subjectEntries[0][1] >= 2) {
        insights.push({
            type: 'subject',
            pattern: `${subjectEntries[0][0]} 시간에 ${subjectEntries[0][1]}회 반복됨`,
            severity: subjectEntries[0][1] >= 3 ? 'high' : 'medium',
            recommendation: `${subjectEntries[0][0]} 수업 시 특별한 관심과 지도가 필요합니다.`
        });
    }

    // Time patterns
    const timeEntries = Object.entries(patterns.byTime).sort((a, b) => b[1] - a[1]);
    if (timeEntries.length > 0 && timeEntries[0][1] >= 2) {
        insights.push({
            type: 'time',
            pattern: `${timeEntries[0][0]}에 ${timeEntries[0][1]}회 반복됨`,
            severity: timeEntries[0][1] >= 3 ? 'high' : 'medium',
            recommendation: `${timeEntries[0][0]} 동안 학생의 행동을 주의 깊게 관찰하세요.`
        });
    }

    // Location patterns
    const locationEntries = Object.entries(patterns.byLocation).sort((a, b) => b[1] - a[1]);
    if (locationEntries.length > 0 && locationEntries[0][1] >= 2) {
        insights.push({
            type: 'location',
            pattern: `${locationEntries[0][0]}에서 ${locationEntries[0][1]}회 반복됨`,
            severity: locationEntries[0][1] >= 3 ? 'high' : 'medium',
            recommendation: `${locationEntries[0][0]} 환경에서의 행동 패턴을 분석하고 개선 방안을 모색하세요.`
        });
    }

    // Day of week patterns
    const dayEntries = Object.entries(patterns.byDayOfWeek).sort((a, b) => b[1] - a[1]);
    if (dayEntries.length > 0 && dayEntries[0][1] >= 2) {
        insights.push({
            type: 'dayOfWeek',
            pattern: `${dayEntries[0][0]}에 ${dayEntries[0][1]}회 발생`,
            severity: dayEntries[0][1] >= 3 ? 'high' : 'medium',
            recommendation: `${dayEntries[0][0]} 시간표나 활동을 검토하여 원인을 파악하세요.`
        });
    }

    // Incident type patterns
    const typeEntries = Object.entries(patterns.byIncidentType).sort((a, b) => b[1] - a[1]);
    if (typeEntries.length > 0 && typeEntries[0][1] >= 2) {
        insights.push({
            type: 'incidentType',
            pattern: `${typeEntries[0][0]} 유형이 ${typeEntries[0][1]}회 반복됨`,
            severity: typeEntries[0][1] >= 3 ? 'high' : 'medium',
            recommendation: `${typeEntries[0][0]} 문제에 대한 체계적인 상담과 지도가 필요합니다.`
        });
    }

    return {
        patterns,
        insights,
        totalIncidents: incidents.length
    };
}

/**
 * POST /api/analyze/pattern
 * Analyze patterns for a student based on their history
 */
router.post('/pattern', authenticate, async (req, res) => {
    try {
        const { studentId, currentIncident } = req.body;

        if (!studentId) {
            return res.status(400).json({
                error: true,
                message: '학생 ID를 입력해주세요.'
            });
        }

        // Get all past incidents for this student
        const incidents = await Incident.find({
            studentId: studentId,
            teacherId: req.teacherId
        })
            .sort({ incidentDate: -1 })
            .limit(50);  // Analyze last 50 incidents

        if (incidents.length === 0) {
            return res.json({
                success: true,
                patterns: null,
                message: '분석할 과거 기록이 없습니다.'
            });
        }

        // Analyze patterns
        const patternAnalysis = analyzePatterns(incidents, currentIncident);

        res.json({
            success: true,
            studentId,
            ...patternAnalysis
        });

    } catch (error) {
        console.error('Pattern analysis error:', error);
        res.status(500).json({
            error: true,
            message: '패턴 분석 중 오류가 발생했습니다.'
        });
    }
});

// POST /api/analyze/letter
router.post('/letter', authenticate, async (req, res) => {
    try {
        const { text, receiver, tone } = req.body;
        const schoolLevel = req.teacher?.schoolLevel || 'all';
        const prompt = PROMPTS.PARENT_LETTER({ text, receiver, tone, schoolLevel });
        // Request text/plain output
        const result = await callGemini(prompt, 5, "text/plain");

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Letter generation error:', error);
        res.status(500).json({
            error: true,
            message: '회신문 생성 중 오류가 발생했습니다.'
        });
    }
});

/**
 * POST /api/analyze/script
 * Generate counseling script
 */
router.post('/script', authenticate, async (req, res) => {
    try {
        const { text, target, goal } = req.body;
        const schoolLevel = req.teacher?.schoolLevel || 'all';
        const prompt = PROMPTS.COUNSELING_SCRIPT({ text, target, goal, schoolLevel });
        // Request text/plain output
        const result = await callGemini(prompt, 5, "text/plain");

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Script generation error:', error);
        res.status(500).json({
            error: true,
            message: '스크립트 생성 중 오류가 발생했습니다.'
        });
    }
});

/**
 * PUT /api/analyze/incidents/:id
 * Update an incident record
 */
router.put('/incidents/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, incidentDate, incidentType } = req.body;

        // Find the incident
        // Check ownership: Teacher must be the creator OR admin
        const query = { _id: id };
        if (req.teacher.role !== 'admin') {
            query.teacherId = req.teacherId;
        }

        const incident = await Incident.findOne(query);

        if (!incident) {
            return res.status(404).json({
                error: true,
                message: '기록을 찾을 수 없거나 수정 권한이 없습니다.'
            });
        }

        // Update fields
        // We update teacherNote which is the user-editable content
        if (content !== undefined) incident.teacherNote = content;
        if (incidentDate !== undefined) incident.incidentDate = incidentDate;
        if (incidentType !== undefined) incident.incidentType = incidentType;

        // Save (triggers pre-save encryption)
        await incident.save();

        res.json({
            success: true,
            message: '기록이 수정되었습니다.',
            incident: incident.decryptFields()
        });

    } catch (error) {
        console.error('Update incident error:', error);
        res.status(500).json({
            error: true,
            message: '기록 수정 중 오류가 발생했습니다.'
        });
    }
});

/**
 * DELETE /api/analyze/incidents/:id
 * Delete an incident record
 */
router.delete('/incidents/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DELETE] Request to delete incident: ${id}`);
        console.log(`[DELETE] Requesting Teacher: ${req.teacherId}, Role: ${req.teacher.role}`);

        // Check ownership: Teacher must be the creator OR admin
        const query = { _id: id };
        if (req.teacher.role !== 'admin') {
            query.teacherId = req.teacherId;
        }
        console.log(`[DELETE] Query:`, JSON.stringify(query));

        const result = await Incident.deleteOne(query);
        console.log(`[DELETE] Result:`, result);

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: true,
                message: '기록을 찾을 수 없거나 삭제 권한이 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '기록이 삭제되었습니다.'
        });

    } catch (error) {
        console.error('Delete incident error:', error);
        res.status(500).json({
            error: true,
            message: '기록 삭제 중 오류가 발생했습니다.'
        });
    }
});

export default router;
