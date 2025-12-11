import 'package:flutter/material.dart';

class QuestionCard extends StatelessWidget {
  final String missingField;

  const QuestionCard({super.key, required this.missingField});

  @override
  Widget build(BuildContext context) {
    String questionText = "";
    switch (missingField) {
      case 'who':
        questionText = "누가 그랬는지 정확히 알 수 없어요. 학생들의 이름을 알려주시겠어요?";
        break;
      case 'when':
        questionText = "언제 일어난 일인가요? (예: 점심시간, 쉬는시간)";
        break;
      case 'where':
        questionText = "어디서 일어난 일인가요? (예: 교실, 복도)";
        break;
      case 'what':
        questionText = "구체적으로 어떤 행동을 했나요?";
        break;
      case 'how':
        questionText = "어떻게 행동했나요? (예: 고의로, 장난으로)";
        break;
      case 'why':
        questionText = "왜 그런 행동을 했는지 이유를 아시나요?";
        break;
      default:
        questionText = "추가 정보가 필요합니다.";
    }

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 10),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        decoration: BoxDecoration(
          border: const Border(left: BorderSide(color: Colors.orange, width: 5)),
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.help_outline, color: Colors.orange),
                SizedBox(width: 8),
                Text(
                  "추가 정보 확인",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              questionText,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 5),
            const Text(
              "아래 입력창에 대답을 적어주시면 내용을 보완해서 다시 분석할게요.",
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
