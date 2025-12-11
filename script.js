// ==========================================
// ⚠️ 중요: 여기에 발급받은 API 키를 입력하세요
// ==========================================
const API_KEY = "AIzaSyCYC7cHuEeevBldpL4UZtB8J4QRtSvwt08";

document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const resultContainer = document.getElementById('result-container');
    const resultTemplate = document.getElementById('result-template');
    const inputArea = document.querySelector('.input-area');

    // State for follow-up questions
    let pendingContext = null; // { originalText: "...", missingField: "why" }

    // Fallback Local Analysis Logic (Rule-based)
    const analyzeInputLocal = (text) => {
        const now = new Date();
        const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

        let subject = "학생";
        let target = "";
        let allNames = [];

        const nameRegex = /([가-힣]{2,4})(이|가|은|는|을|를|에게|한테|와|과)/g;
        let match;
        while ((match = nameRegex.exec(text)) !== null) {
            const name = match[1];
            const particle = match[2];
            allNames.push(name);
            if (['이', '가', '은', '는'].includes(particle)) subject = name;
            else if (['을', '를', '에게', '한테', '와', '과'].includes(particle)) target = name;
        }
        if (allNames.length > 0 && subject === "학생") subject = allNames[0];

        let whoDisplay = subject;
        if (target) whoDisplay += ` (대상: ${target})`;
        else if (allNames.length > 1) whoDisplay = allNames.join(", ");

        let where = "교내";
        const locations = ["교실", "복도", "급식실", "운동장", "체육관", "화장실", "도서관", "음악실", "미술실"];
        for (const loc of locations) {
            if (text.includes(loc)) { where = loc; break; }
        }

        let what = "부적절한 행동";
        let specificAction = "";
        let category = "생활지도";

        const checkAction = (regex, actionName, cat, neisAction) => {
            if (text.match(regex)) {
                what = actionName;
                category = cat;
                specificAction = neisAction;
                return true;
            }
            return false;
        };

        if (checkAction(/때[렸리]|쳤|차[가-힣]?|찼|밀[쳤어]|싸[웠움]|폭행|던[졌지]|가해|괴롭/, "신체적 폭력", "school_violence", "신체적 고통을 주는 행동을")) { }
        else if (checkAction(/욕[설하했]|놀[렸리]|비방|험담|협박|조롱/, "언어 폭력", "verbal_abuse", "언어적 모욕감을 주는 말을")) { }
        else if (checkAction(/떠[들든]|방해|돌아다|자[지잤]|소란|장난/, "수업 방해", "class_disruption", "수업 분위기를 저해하는 행동을")) { }
        else if (checkAction(/훔[쳤쳐]|가져|절도|손댔/, "물건 절취", "theft", "타인의 물건을 허락 없이 가져가는 행동을")) { }
        else if (checkAction(/거짓|속[였이]|기만/, "거짓말", "lying", "사실과 다른 내용을 말하여 혼란을 주는 행동을")) { }

        let when = dateStr;
        if (text.includes("아침")) when += " 아침 시간";
        else if (text.includes("점심") || text.includes("급식")) when += " 점심 시간";
        else if (text.includes("쉬는")) when += " 쉬는 시간";
        else if (text.includes("수업")) when += " 수업 시간";
        else if (text.includes("방과후")) when += " 방과후 시간";

        let guidance = "";
        switch (category) {
            case "school_violence":
                guidance = `1. <strong>즉시 분리:</strong> ${subject} 학생과 ${target || "피해"} 학생을 즉시 분리하십시오.<br>2. <strong>상태 확인:</strong> 학생들의 신체적/심리적 상태를 확인하고 필요 시 보건실로 이동시키십시오.<br>3. <strong>사안 조사:</strong> 육하원칙에 의거하여 정확한 사안 조사를 실시하십시오.`;
                break;
            case "verbal_abuse":
                guidance = `1. <strong>언어 지도:</strong> ${subject} 학생에게 바른 언어 사용의 중요성을 교육하십시오.<br>2. <strong>화해 유도:</strong> ${target ? target + " 학생에게 " : ""}진심 어린 사과를 하도록 지도하십시오.<br>3. <strong>감정 코칭:</strong> 화가 났을 때 말로 표현하는 올바른 방법을 안내하십시오.`;
                break;
            case "class_disruption":
                guidance = `1. <strong>주의 환기:</strong> 수업 규칙을 상기시키고 다른 학생들의 학습권을 존중하도록 지도하십시오.<br>2. <strong>원인 상담:</strong> 수업에 집중하지 못하는 이유를 파악하기 위해 상담을 진행하십시오.`;
                break;
            default:
                guidance = `1. <strong>사실 확인:</strong> 학생의 이야기를 경청하고 정확한 사실 관계를 파악하십시오.<br>2. <strong>행동 교정:</strong> 잘못된 행동에 대해 인지시키고 올바른 행동을 하도록 지도하십시오.`;
        }

        let neis = `${when}, ${where}에서 ${subject} 학생이 `;
        if (target) neis += `${target} 학생에게 `;
        neis += `${specificAction || "부적절한 행동을"} 함. `;
        neis += `이에 교사는 학생과 면담을 실시하여 자신의 행동이 ${target ? "상대방" : "타인"}에게 미치는 영향을 인지시키고, `;
        neis += `앞으로는 ${category === 'verbal_abuse' ? "고운 말을 사용하기로" : "올바른 행동을 하기로"} 약속함.`;

        return {
            who: whoDisplay,
            when: when,
            where: where,
            what: what,
            how: "고의/우발적",
            why: "추후 상담 필요",
            guidance: guidance,
            neis: neis,
            isLocal: true
        };
    };

    // Real AI Analysis Logic using Fetch API (No SDK needed)
    const analyzeInput = async (text) => {
        // Check API Key
        let currentKey = API_KEY;
        if (currentKey === "YOUR_API_KEY_HERE") {
            const userKey = prompt("Google Gemini API 키를 입력해주세요 (저장되지 않습니다):");
            if (userKey) {
                currentKey = userKey;
            } else {
                // Fallback if no key provided
                return analyzeInputLocal(text);
            }
        }

        try {
            const promptText = `
            너는 학교 생활지도 전문가야. 초등학교, 중학교, 고등학교 모든 학교급의 생활지도를 지원할 수 있어야 해. 다음 선생님의 입력 내용을 분석해서 JSON 형식으로 답변해줘.
            
            입력 내용: "${text}"

            요구사항:
            1. 5W1H(누가, 언제, 어디서, 무엇을, 어떻게, 왜)를 분석해.
               - '누가'는 가해/피해 학생을 명확히 구분하여 **단일 문자열**로 작성해. (예: "철수(가해), 영희(피해)")
               - **절대 JSON 객체로 중첩하지 말고, 모든 필드는 문자열(String)이어야 해.**
               - '무엇을'은 구체적인 행동을 요약해.
               - **정보가 부족하거나 확실하지 않은 항목은 추측하지 말고 반드시 "미확인"이라고 적어.**
            2. 'guidance' 필드에 교사가 취해야 할 생활지도 가이드를 HTML 태그(<br>, <strong> 등)를 사용하여 3단계로 작성해.
            3. 'neis' 필드에 학교생활기록부(나이스) 또는 상담일지에 입력할 격식 있고 객관적인 문구를 작성해. (~함, ~임 체 사용)
            
            출력 포맷(JSON):
            {
                "who": "철수(가해), 영희(피해)",
                "when": "2024년 5월 20일 점심시간",
                "where": "급식실 앞 복도",
                "what": "새치기를 하려다 밀침",
                "how": "고의적으로 강하게",
                "why": "빨리 밥을 먹고 싶어서",
                "guidance": "...",
                "neis": "..."
            }
            JSON만 출력하고 다른 말은 하지 마.
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${currentKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: promptText
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`API Error: ${response.status} ${response.statusText}\n${errorBody}`);
                // Fallback to local analysis on API error
                return analyzeInputLocal(text);
            }

            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;

            // Clean up markdown code blocks if present
            const jsonStr = textResponse.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);

        } catch (error) {
            console.error("Gemini Error:", error);
            // Fallback to local analysis on network/parsing error
            return analyzeInputLocal(text);
        }
    };

    const createResultCard = (analysis) => {
        const clone = resultTemplate.content.cloneNode(true);

        if (analysis.error) {
            clone.querySelector('.card-section').innerHTML = `<p style="color: red;">${analysis.message}</p>`;
            // Hide other sections
            const sections = clone.querySelectorAll('.card-section');
            if (sections[1]) sections[1].style.display = 'none';
            if (sections[2]) sections[2].style.display = 'none';
            return clone;
        }

        // Helper to safely display values (handles objects/arrays gracefully)
        const safeDisplay = (val) => {
            if (!val) return "-";
            if (typeof val === 'object') {
                // If it's an object or array, try to join its values
                return Object.values(val).join(', ');
            }
            return val;
        };

        clone.querySelector('.who').textContent = safeDisplay(analysis.who);
        clone.querySelector('.when').textContent = safeDisplay(analysis.when);
        clone.querySelector('.where').textContent = safeDisplay(analysis.where);
        clone.querySelector('.what').textContent = safeDisplay(analysis.what);
        clone.querySelector('.how').textContent = safeDisplay(analysis.how);
        clone.querySelector('.why').textContent = safeDisplay(analysis.why);

        clone.querySelector('.guidance-text').innerHTML = analysis.guidance || "가이드 생성 실패";
        clone.querySelector('.neis-text-box').textContent = analysis.neis || "문구 생성 실패";

        // Source Badge
        const badge = document.createElement('span');
        badge.style.cssText = `
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-left: 10px;
            vertical-align: middle;
        `;
        if (analysis.isLocal) {
            badge.textContent = "기본 분석 (AI 연결 실패)";
            badge.style.backgroundColor = "#ffecb3";
            badge.style.color = "#ff6f00";
        } else {
            badge.textContent = "Gemini AI 분석";
            badge.style.backgroundColor = "#e3f2fd";
            badge.style.color = "#1565c0";
        }
        clone.querySelector('h3').appendChild(badge);

        // Copy Button Logic
        const copyBtn = clone.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(analysis.neis).then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<span class="material-icons-round">check</span> 복사됨';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                });
            });
        }

        return clone;
    };

    const createQuestionCard = (missingField) => {
        const card = document.createElement('div');
        card.className = 'result-card fade-in question-card';
        card.style.borderLeft = "5px solid #FF9800"; // Orange for warning/question

        let questionText = "";
        switch (missingField) {
            case 'who': questionText = "누가 그랬는지 정확히 알 수 없어요. 학생들의 이름을 알려주시겠어요?"; break;
            case 'when': questionText = "언제 일어난 일인가요? (예: 점심시간, 쉬는시간)"; break;
            case 'where': questionText = "어디서 일어난 일인가요? (예: 교실, 복도)"; break;
            case 'what': questionText = "구체적으로 어떤 행동을 했나요?"; break;
            case 'how': questionText = "어떻게 행동했나요? (예: 고의로, 장난으로)"; break;
            case 'why': questionText = "왜 그런 행동을 했는지 이유를 아시나요?"; break;
            default: questionText = "추가 정보가 필요합니다.";
        }

        card.innerHTML = `
            <div class="card-section">
                <h3><span class="material-icons-round" style="color: #FF9800;">help_outline</span> 추가 정보 확인</h3>
                <p class="question-text" style="font-size: 1.1rem; margin: 10px 0;">${questionText}</p>
                <p class="input-hint" style="font-size: 0.9rem; color: var(--text-sub);">아래 입력창에 대답을 적어주시면 내용을 보완해서 다시 분석할게요.</p>
            </div>
        `;
        return card;
    };

    const handleInput = async () => {
        const text = userInput.value.trim();
        if (!text) return;

        // Clear input
        userInput.value = '';

        // Show loading state
        const loadingCard = document.createElement('div');
        loadingCard.className = 'result-card fade-in';
        loadingCard.innerHTML = '<p style="text-align:center; color:var(--text-sub);">제미나이가 분석 중입니다... <span class="material-icons-round" style="vertical-align:middle; animation:spin 1s infinite linear;">autorenew</span></p>';

        if (resultContainer.classList.contains('hidden')) {
            resultContainer.classList.remove('hidden');
            inputArea.style.marginTop = "0";
        }

        // If we are in a follow-up state, remove the previous question card
        const prevQuestion = resultContainer.querySelector('.question-card');
        if (prevQuestion) prevQuestion.remove();

        resultContainer.insertBefore(loadingCard, resultContainer.firstChild);

        // Prepare text for analysis
        let textToAnalyze = text;
        if (pendingContext) {
            textToAnalyze = `${pendingContext.originalText} ${text}`;
            // Reset context after using it, but we might set it again if more info is needed
            pendingContext = null;
        }

        // Analyze
        const analysis = await analyzeInput(textToAnalyze);

        // Remove loading
        resultContainer.removeChild(loadingCard);

        // Check for missing fields (Priority: Who > What > Where > When > Why > How)
        // We only ask for one thing at a time to avoid overwhelming the user.
        const fieldsToCheck = ['who', 'what', 'where', 'when', 'why', 'how'];
        let missingField = null;

        for (const field of fieldsToCheck) {
            if (analysis[field] === "미확인" || analysis[field] === null) {
                missingField = field;
                break;
            }
        }

        if (missingField) {
            // Found a missing field, ask for it
            pendingContext = { originalText: textToAnalyze, missingField: missingField };
            const questionCard = createQuestionCard(missingField);
            resultContainer.insertBefore(questionCard, resultContainer.firstChild);

            // Focus input for answer
            userInput.placeholder = `${missingField === 'why' ? '이유' : '내용'}를 입력해주세요...`;
            userInput.focus();
        } else {
            // All good, show result
            const resultCard = createResultCard(analysis);
            resultContainer.insertBefore(resultCard, resultContainer.firstChild);
            userInput.placeholder = "학생의 행동을 입력하거나 말해보세요...";
        }
    };

    // Event Listeners
    sendBtn.addEventListener('click', handleInput);

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
            handleInput();
        }
    });

    // Web Speech API
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ko-KR';

        micBtn.addEventListener('click', () => {
            if (micBtn.classList.contains('listening')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

        recognition.onstart = () => {
            micBtn.classList.add('listening');
        };

        recognition.onend = () => {
            micBtn.classList.remove('listening');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
        };
    } else {
        micBtn.style.display = 'none';
        console.log("Web Speech API not supported");
    }
});

// Add spin animation for loading
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleSheet);
