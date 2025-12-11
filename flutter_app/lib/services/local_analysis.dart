import 'package:intl/intl.dart';
import '../models/analysis_result.dart';

class LocalAnalysisService {
  AnalysisResult analyze(String text) {
    final now = DateTime.now();
    final dateStr = DateFormat('yyyy년 M월 d일').format(now);

    String subject = "학생";
    String target = "";
    List<String> allNames = [];

    final nameRegex = RegExp(r'([가-힣]{2,4})(이|가|은|는|을|를|에게|한테|와|과)');
    final matches = nameRegex.allMatches(text);

    for (final match in matches) {
      final name = match.group(1)!;
      final particle = match.group(2)!;
      allNames.add(name);
      if (['이', '가', '은', '는'].contains(particle)) {
        subject = name;
      } else if (['을', '를', '에게', '한테', '와', '과'].contains(particle)) {
        target = name;
      }
    }

    if (allNames.isNotEmpty && subject == "학생") {
      subject = allNames[0];
    }

    String whoDisplay = subject;
    if (target.isNotEmpty) {
      whoDisplay += " (대상: $target)";
    } else if (allNames.length > 1) {
      whoDisplay = allNames.join(", ");
    }

    String where = "교내";
    const locations = ["교실", "복도", "급식실", "운동장", "체육관", "화장실", "도서관", "음악실", "미술실"];
    for (final loc in locations) {
      if (text.contains(loc)) {
        where = loc;
        break;
      }
    }

    String what = "부적절한 행동";
    String specificAction = "";
    String category = "생활지도";

    bool checkAction(RegExp regex, String actionName, String cat, String neisAction) {
      if (regex.hasMatch(text)) {
        what = actionName;
        category = cat;
        specificAction = neisAction;
        return true;
      }
      return false;
    }

    if (checkAction(RegExp(r'때[렸리]|쳤|차[가-힣]?|찼|밀[쳤어]|싸[웠움]|폭행|던[졌지]|가해|괴롭'), "신체적 폭력", "school_violence", "신체적 고통을 주는 행동을")) {
    } else if (checkAction(RegExp(r'욕[설하했]|놀[렸리]|비방|험담|협박|조롱'), "언어 폭력", "verbal_abuse", "언어적 모욕감을 주는 말을")) {
    } else if (checkAction(RegExp(r'떠[들든]|방해|돌아다|자[지잤]|소란|장난'), "수업 방해", "class_disruption", "수업 분위기를 저해하는 행동을")) {
    } else if (checkAction(RegExp(r'훔[쳤쳐]|가져|절도|손댔'), "물건 절취", "theft", "타인의 물건을 허락 없이 가져가는 행동을")) {
    } else if (checkAction(RegExp(r'거짓|속[였이]|기만'), "거짓말", "lying", "사실과 다른 내용을 말하여 혼란을 주는 행동을")) {
    }

    String when = dateStr;
    if (text.contains("아침")) {
      when += " 아침 시간";
    } else if (text.contains("점심") || text.contains("급식")) {
      when += " 점심 시간";
    } else if (text.contains("쉬는")) {
      when += " 쉬는 시간";
    } else if (text.contains("수업")) {
      when += " 수업 시간";
    } else if (text.contains("방과후")) {
      when += " 방과후 시간";
    }

    String guidance = "";
    switch (category) {
      case "school_violence":
        guidance = "1. **즉시 분리:** $subject 학생과 ${target.isNotEmpty ? target : "피해"} 학생을 즉시 분리하십시오.\n\n"
            "2. **상태 확인:** 학생들의 신체적/심리적 상태를 확인하고 필요 시 보건실로 이동시키십시오.\n\n"
            "3. **사안 조사:** 육하원칙에 의거하여 정확한 사안 조사를 실시하십시오.";
        break;
      case "verbal_abuse":
        guidance = "1. **언어 지도:** $subject 학생에게 바른 언어 사용의 중요성을 교육하십시오.\n\n"
            "2. **화해 유도:** ${target.isNotEmpty ? target + " 학생에게 " : ""}진심 어린 사과를 하도록 지도하십시오.\n\n"
            "3. **감정 코칭:** 화가 났을 때 말로 표현하는 올바른 방법을 안내하십시오.";
        break;
      case "class_disruption":
        guidance = "1. **주의 환기:** 수업 규칙을 상기시키고 다른 학생들의 학습권을 존중하도록 지도하십시오.\n\n"
            "2. **원인 상담:** 수업에 집중하지 못하는 이유를 파악하기 위해 상담을 진행하십시오.";
        break;
      default:
        guidance = "1. **사실 확인:** 학생의 이야기를 경청하고 정확한 사실 관계를 파악하십시오.\n\n"
            "2. **행동 교정:** 잘못된 행동에 대해 인지시키고 올바른 행동을 하도록 지도하십시오.";
    }

    String neis = "$when, $where에서 $subject 학생이 ";
    if (target.isNotEmpty) neis += "$target 학생에게 ";
    neis += "${specificAction.isNotEmpty ? specificAction : "부적절한 행동을"} 함. ";
    neis += "이에 교사는 학생과 면담을 실시하여 자신의 행동이 ${target.isNotEmpty ? "상대방" : "타인"}에게 미치는 영향을 인지시키고, ";
    neis += "앞으로는 ${category == 'verbal_abuse' ? "고운 말을 사용하기로" : "올바른 행동을 하기로"} 약속함.";

    return AnalysisResult(
      who: whoDisplay,
      when: when,
      where: where,
      what: what,
      how: "고의/우발적",
      why: "추후 상담 필요",
      guidance: guidance,
      neis: neis,
      isLocal: true,
    );
  }
}
