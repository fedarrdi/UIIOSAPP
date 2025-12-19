import 'note_entry.dart';

class DailyData {
  final int count;
  final List<NoteEntry> entries;

  DailyData({
    required this.count,
    required this.entries,
  });

  Map<String, dynamic> toJson() {
    return {
      'count': count,
      'entries': entries.map((e) => e.toJson()).toList(),
    };
  }

  factory DailyData.fromJson(Map<String, dynamic> json) {
    return DailyData(
      count: json['count'] as int,
      entries: (json['entries'] as List)
          .map((e) => NoteEntry.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class StreakData {
  final int current;
  final int longest;

  StreakData({
    required this.current,
    required this.longest,
  });
}
