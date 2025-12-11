import 'dart:convert';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/analysis_result.dart';
import 'local_analysis.dart';

class GeminiService {
  // ⚠️ 중요: 여기에 발급받은 API 키를 입력하세요
  static const String _apiKey = "AIzaSyCYC7cHuEeevBldpL4UZtB8J4QRtSvwt08";
  
  final LocalAnalysisService _localService = LocalAnalysisService();

  Future<AnalysisResult> analyze(String text, {String? apiKey}) async {
    final key = apiKey ?? _apiKey;
    
    if (key == "YOUR_API_KEY_HERE") {
      // If no key is provided, fallback to local
      return _localService.analyze(text);
    }

    try {
      final model = GenerativeModel(
        model: 'gemini-2.0-flash',
        apiKey: key,
      );

      final prompt = '''
      너는 학교 생활지도 전문가야. 초등학교, 중학교, 고등학교 모든 학교급의 생활지도를 지원할 수 있어야 해. 다음 선생님의 입력 내용을 분석해서 JSON 형식으로 답변해줘.
      
      입력 내용: "$text"

      요구사항:
      1. 5W1H(누가, 언제, 어디서, 무엇을, 어떻게, 왜)를 분석해.
         - '누가'는 가해/피해 학생을 명확히 구분하여 **단일 문자열**로 작성해. (예: "철수(가해), 영희(피해)")
         - **절대 JSON 객체로 중첩하지 말고, 모든 필드는 문자열(String)이어야 해.**
         - '무엇을'은 구체적인 행동을 요약해.
         - **정보가 부족하거나 확실하지 않은 항목은 추측하지 말고 반드시 "미확인"이라고 적어.**
      2. 'guidance' 필드에 교사가 취해야 할 생활지도 가이드를 마크다운 형식으로 3단계로 작성해.
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
      ''';

      final content = [Content.text(prompt)];
      final response = await model.generateContent(content);
      
      final responseText = response.text;
      if (responseText == null) {
        throw Exception("Empty response from Gemini");
      }

      // Clean up markdown code blocks if present
      final jsonStr = responseText.replaceAll(RegExp(r'```json|```'), "").trim();
      final jsonMap = jsonDecode(jsonStr);
      
      return AnalysisResult.fromJson(jsonMap);

    } catch (e) {
      print("Gemini Error: $e");
      // Fallback to local analysis on error
      return _localService.analyze(text);
    }
  }
}
