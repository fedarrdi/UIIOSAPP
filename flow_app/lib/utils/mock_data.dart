import 'dart:math';
import '../models/daily_data.dart';
import '../models/note_entry.dart';
import 'date_utils.dart';

class MockDataGenerator {
  static final Random _random = Random();

  static Map<String, DailyData> generateMockData() {
    final Map<String, DailyData> history = {};
    final today = DateTime.now();

    // Generate 150 days of data (approx 5 months)
    for (int i = 0; i < 150; i++) {
      final d = today.subtract(Duration(days: i));
      final dateStr = DateUtilsHelper.getDateString(d);

      bool shouldHaveActivity = false;

      // Current streak of 7 days (Day 0 to 6)
      if (i < 7) {
        shouldHaveActivity = true;
      }
      // Break the streak at day 7 to ensure it's exactly 7 days
      else if (i == 7) {
        shouldHaveActivity = false;
      }
      // Random activity for the rest (Day 8+)
      else {
        shouldHaveActivity =
            _random.nextDouble() > 0.2; // 80% chance of activity
      }

      if (shouldHaveActivity) {
        final count = _random.nextInt(9) + 2; // 2 to 10 interactions

        // Create some entries
        final entries = <NoteEntry>[];
        for (int j = 0; j < count; j++) {
          if (_random.nextDouble() > 0.7) {
            // 30% chance of a note
            entries.add(NoteEntry(
              quality: _random.nextInt(5) + 1,
              note: "Mock interaction note",
              timestamp: d.add(Duration(hours: j)),
            ));
          }
        }

        history[dateStr] = DailyData(
          count: count,
          entries: entries,
        );
      }
    }

    return history;
  }
}
