import 'package:flutter/material.dart';
import '../models/analysis_result.dart';
import '../services/gemini_service.dart';
import '../widgets/result_card.dart';
import '../widgets/question_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _controller = TextEditingController();
  final GeminiService _geminiService = GeminiService();
  
  // List of widgets to display (Results, Questions, etc.)
  final List<Widget> _results = [];
  
  bool _isAnalyzing = false;
  
  // Context for follow-up questions
  String? _pendingOriginalText;
  String? _pendingMissingField;

  Future<void> _handleSubmitted(String text) async {
    if (text.trim().isEmpty) return;
    
    _controller.clear();
    setState(() {
      _isAnalyzing = true;
      // Remove previous question card if exists
      _results.removeWhere((w) => w is QuestionCard);
    });

    String textToAnalyze = text;
    if (_pendingOriginalText != null) {
      textToAnalyze = "$_pendingOriginalText $text";
      _pendingOriginalText = null;
      _pendingMissingField = null;
    }

    try {
      final analysis = await _geminiService.analyze(textToAnalyze);
      
      setState(() {
        _isAnalyzing = false;
        
        // Check for missing fields
        final fieldsToCheck = ['who', 'what', 'where', 'when', 'why', 'how'];
        String? missingField;
        
        for (final field in fieldsToCheck) {
          String? value;
          switch (field) {
            case 'who': value = analysis.who; break;
            case 'what': value = analysis.what; break;
            case 'where': value = analysis.where; break;
            case 'when': value = analysis.when; break;
            case 'why': value = analysis.why; break;
            case 'how': value = analysis.how; break;
          }
          
          if (value == "미확인" || value == null) {
            missingField = field;
            break;
          }
        }

        if (missingField != null) {
          _pendingOriginalText = textToAnalyze;
          _pendingMissingField = missingField;
          _results.insert(0, QuestionCard(missingField: missingField));
        } else {
          _results.insert(0, ResultCard(analysis: analysis));
        }
      });
    } catch (e) {
      setState(() {
        _isAnalyzing = false;
        _results.insert(0, Card(
          color: Colors.red[50],
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text("오류가 발생했습니다: $e"),
          ),
        ));
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("생활지도 도우미 (AI)", style: TextStyle(fontWeight: FontWeight.bold)),
            Text("제미나이가 분석하는 학생 사안 처리", style: TextStyle(fontSize: 12)),
          ],
        ),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _results.length + (_isAnalyzing ? 1 : 0),
              itemBuilder: (context, index) {
                if (_isAnalyzing && index == 0) {
                  return const Card(
                    child: Padding(
                      padding: EdgeInsets.all(20.0),
                      child: Center(
                        child: Column(
                          children: [
                            CircularProgressIndicator(),
                            SizedBox(height: 10),
                            Text("제미나이가 분석 중입니다..."),
                          ],
                        ),
                      ),
                    ),
                  );
                }
                final itemIndex = _isAnalyzing ? index - 1 : index;
                return _results[itemIndex];
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withValues(alpha: 0.2),
                  spreadRadius: 1,
                  blurRadius: 5,
                  offset: const Offset(0, -3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_pendingMissingField != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Text(
                      "${_pendingMissingField == 'why' ? '이유' : '내용'}를 입력해주세요...",
                      style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold),
                    ),
                  ),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        decoration: InputDecoration(
                          hintText: _pendingMissingField != null 
                              ? "답변을 입력하세요..." 
                              : "학생의 행동을 입력하거나 말해보세요...",
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor: Colors.grey[100],
                          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        ),
                        onSubmitted: _handleSubmitted,
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      onPressed: () => _handleSubmitted(_controller.text),
                      icon: const Icon(Icons.send),
                      color: Colors.indigo,
                      tooltip: "전송",
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  "예: \"철수가 점심시간에 급식실에서 영희를 밀쳤어\"",
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
