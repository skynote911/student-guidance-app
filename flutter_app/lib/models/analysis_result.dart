class AnalysisResult {
  final String who;
  final String when;
  final String where;
  final String what;
  final String how;
  final String why;
  final String guidance;
  final String neis;
  final bool isLocal;
  final String? error;

  AnalysisResult({
    required this.who,
    required this.when,
    required this.where,
    required this.what,
    required this.how,
    required this.why,
    required this.guidance,
    required this.neis,
    this.isLocal = false,
    this.error,
  });

  factory AnalysisResult.fromJson(Map<String, dynamic> json) {
    return AnalysisResult(
      who: json['who'] ?? '미확인',
      when: json['when'] ?? '미확인',
      where: json['where'] ?? '미확인',
      what: json['what'] ?? '미확인',
      how: json['how'] ?? '미확인',
      why: json['why'] ?? '미확인',
      guidance: json['guidance'] ?? '',
      neis: json['neis'] ?? '',
      isLocal: json['isLocal'] ?? false,
    );
  }

  factory AnalysisResult.error(String message) {
    return AnalysisResult(
      who: '',
      when: '',
      where: '',
      what: '',
      how: '',
      why: '',
      guidance: '',
      neis: '',
      error: message,
    );
  }
}
