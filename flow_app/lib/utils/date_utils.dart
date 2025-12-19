import 'package:intl/intl.dart';

class DateUtilsHelper {
  static String getTodayString() {
    final now = DateTime.now();
    return DateFormat('yyyy-MM-dd').format(now);
  }

  static String getDateString(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  static List<String> getPastDates(int days) {
    final dates = <String>[];
    final today = DateTime.now();

    for (int i = days - 1; i >= 0; i--) {
      final date = today.subtract(Duration(days: i));
      dates.add(getDateString(date));
    }

    return dates;
  }

  static String formatTime(DateTime dateTime) {
    return DateFormat('HH:mm').format(dateTime);
  }

  static String formatDate(DateTime dateTime) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final dateOnly = DateTime(dateTime.year, dateTime.month, dateTime.day);

    if (dateOnly == today) {
      return 'Today';
    } else if (dateOnly == yesterday) {
      return 'Yesterday';
    } else {
      return DateFormat('MMM d').format(dateTime);
    }
  }
}
