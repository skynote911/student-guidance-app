import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../models/analysis_result.dart';

class ResultCard extends StatelessWidget {
  final AnalysisResult analysis;

  const ResultCard({super.key, required this.analysis});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 10),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 5W1H Section
            _buildSectionHeader(Icons.analytics, "5W1H 분석", analysis.isLocal),
            const SizedBox(height: 10),
            _buildAnalysisGrid(),
            const Divider(height: 30),

            // Guidance Section
            _buildSectionHeader(Icons.school, "생활지도 가이드", null),
            const SizedBox(height: 10),
            MarkdownBody(data: analysis.guidance),
            const Divider(height: 30),

            // NEIS Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildSectionHeader(Icons.description, "나이스(NEIS) 입력용", null),
                TextButton.icon(
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: analysis.neis));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("복사되었습니다.")),
                    );
                  },
                  icon: const Icon(Icons.content_copy, size: 18),
                  label: const Text("복사"),
                ),
              ],
            ),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Text(analysis.neis),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title, bool? isLocal) {
    return Row(
      children: [
        Icon(icon, color: Colors.indigo),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.indigo),
        ),
        if (isLocal != null) ...[
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: isLocal ? Colors.amber[100] : Colors.blue[100],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              isLocal ? "기본 분석" : "Gemini AI",
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isLocal ? Colors.orange[900] : Colors.blue[900],
              ),
            ),
          ),
        ]
      ],
    );
  }

  Widget _buildAnalysisGrid() {
    return Column(
      children: [
        _buildGridRow("누가", analysis.who),
        _buildGridRow("언제", analysis.when),
        _buildGridRow("어디서", analysis.where),
        _buildGridRow("무엇을", analysis.what),
        _buildGridRow("어떻게", analysis.how),
        _buildGridRow("왜", analysis.why),
      ],
    );
  }

  Widget _buildGridRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 60,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
            ),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}
