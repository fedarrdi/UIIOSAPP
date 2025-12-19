import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/daily_data.dart';
import '../models/note_entry.dart';
import '../utils/mock_data.dart';
import '../utils/streak_calculator.dart';

enum AppScreen {
  splash,
  onboarding,
  paywall,
  signup,
  app,
}

class AppState {
  final AppScreen currentScreen;
  final Map<String, DailyData> dailyHistory;
  final bool hasCompletedOnboarding;

  AppState({
    required this.currentScreen,
    required this.dailyHistory,
    required this.hasCompletedOnboarding,
  });

  AppState copyWith({
    AppScreen? currentScreen,
    Map<String, DailyData>? dailyHistory,
    bool? hasCompletedOnboarding,
  }) {
    return AppState(
      currentScreen: currentScreen ?? this.currentScreen,
      dailyHistory: dailyHistory ?? this.dailyHistory,
      hasCompletedOnboarding:
          hasCompletedOnboarding ?? this.hasCompletedOnboarding,
    );
  }

  StreakData get streaks => StreakCalculator.calculateStreaks(dailyHistory);
}

class AppStateNotifier extends StateNotifier<AppState> {
  AppStateNotifier()
      : super(AppState(
          currentScreen: AppScreen.splash,
          dailyHistory: MockDataGenerator.generateMockData(),
          hasCompletedOnboarding: false,
        )) {
    _loadOnboardingStatus();
  }

  Future<void> _loadOnboardingStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final completed = prefs.getBool('onboarding-completed') ?? false;

    if (completed) {
      state = state.copyWith(
        currentScreen: AppScreen.app,
        hasCompletedOnboarding: true,
      );
    }
  }

  void navigateToScreen(AppScreen screen) {
    state = state.copyWith(currentScreen: screen);
  }

  Future<void> completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding-completed', true);

    state = state.copyWith(
      hasCompletedOnboarding: true,
      currentScreen: AppScreen.app,
    );
  }

  void addInteraction(int quality, String note) {
    final today = DateTime.now();
    final dateStr =
        '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

    final currentData = state.dailyHistory[dateStr] ?? DailyData(count: 0, entries: []);

    final newEntry = NoteEntry(
      quality: quality,
      note: note,
      timestamp: DateTime.now(),
    );

    final newData = DailyData(
      count: currentData.count + 1,
      entries: [...currentData.entries, newEntry],
    );

    final newHistory = Map<String, DailyData>.from(state.dailyHistory);
    newHistory[dateStr] = newData;

    state = state.copyWith(dailyHistory: newHistory);
  }
}

final appStateProvider =
    StateNotifierProvider<AppStateNotifier, AppState>((ref) {
  return AppStateNotifier();
});
