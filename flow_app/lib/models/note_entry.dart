class NoteEntry {
  final int quality;
  final String note;
  final DateTime timestamp;

  NoteEntry({
    required this.quality,
    required this.note,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() {
    return {
      'quality': quality,
      'note': note,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory NoteEntry.fromJson(Map<String, dynamic> json) {
    return NoteEntry(
      quality: json['quality'] as int,
      note: json['note'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}
