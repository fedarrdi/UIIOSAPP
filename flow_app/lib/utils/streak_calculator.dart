import '../models/daily_data.dart';
import 'date_utils.dart';

class StreakCalculator {
  static StreakData calculateStreaks(Map<String, DailyData> history) {
    final dates = history.keys.toList()..sort();
    if (dates.isEmpty) {
      return StreakData(current: 0, longest: 0);
    }

    // Calculate Longest Streak
    int maxStreak = 0;
    int currentRun = 0;
    DateTime? lastDate;

    for (final dateStr in dates) {
      final count = history[dateStr]!.count;
      if (count > 0) {
        final currentDate = DateTime.parse(dateStr);
        if (lastDate != null) {
          final diffDays = currentDate.difference(lastDate).inDays;

          if (diffDays == 1) {
            currentRun++;
          } else {
            currentRun = 1;
          }
        } else {
          currentRun = 1;
        }
        lastDate = currentDate;
        if (currentRun > maxStreak) {
          maxStreak = currentRun;
        }
      }
    }

    // Calculate Current Streak
    int streak = 0;
    DateTime d = DateTime.now();
    bool missAllowed = true; // Allow today to be missed if checking status

    // Check today
    final todayStr = DateUtilsHelper.getDateString(d);
    if (history[todayStr] != null && history[todayStr]!.count > 0) {
      streak++;
      missAllowed = false;
    }

    // Go backwards
    while (true) {
      d = d.subtract(const Duration(days: 1));
      final dStr = DateUtilsHelper.getDateString(d);

      if (history[dStr] != null && history[dStr]!.count > 0) {
        streak++;
        missAllowed = false;
      } else {
        if (missAllowed) {
          missAllowed = false;
          continue; // Check yesterday
        }
        break;
      }
    }

    return StreakData(current: streak, longest: maxStreak);
  }
}
