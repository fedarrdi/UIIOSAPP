import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/app_colors.dart';
import '../providers/app_state_provider.dart';
import '../utils/date_utils.dart';
import 'dart:math' as math;

class CounterPage extends ConsumerStatefulWidget {
  const CounterPage({super.key});

  @override
  ConsumerState<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends ConsumerState<CounterPage> {
  bool showQualitySlider = false;
  int selectedQuality = 3;
  String note = '';
  String? openModal;
  double dailyGoalSetting = 10;
  String? celebrationModal; // 'streak_7', 'streak_30', 'streak_90', 'streak_180', 'streak_365', 'new_best', 'goal_complete'

  void addInteraction() {
    final appState = ref.read(appStateProvider);
    final todayStr = DateUtilsHelper.getTodayString();
    final todayData = appState.dailyHistory[todayStr];
    final currentCount = todayData?.count ?? 0;
    final previousStreak = appState.streaks.current;
    final longestStreak = appState.streaks.longest;

    // Add the interaction
    ref.read(appStateProvider.notifier).addInteraction(selectedQuality, note);

    setState(() {
      showQualitySlider = false;
      note = '';
      selectedQuality = 3;

      // Check for goal completion (first time reaching daily goal)
      final newCount = currentCount + 1;
      if (newCount == dailyGoalSetting.toInt() && currentCount < dailyGoalSetting.toInt()) {
        celebrationModal = 'goal_complete';
      }
      // Check for streak milestones
      else {
        final newAppState = ref.read(appStateProvider);
        final newStreak = newAppState.streaks.current;

        // Check if this is a new best
        if (newStreak > longestStreak && newStreak > 7) {
          celebrationModal = 'new_best';
        }
        // Check for milestone achievements
        else if (newStreak == 365 && previousStreak < 365) {
          celebrationModal = 'streak_365';
        } else if (newStreak == 180 && previousStreak < 180) {
          celebrationModal = 'streak_180';
        } else if (newStreak == 90 && previousStreak < 90) {
          celebrationModal = 'streak_90';
        } else if (newStreak == 30 && previousStreak < 30) {
          celebrationModal = 'streak_30';
        } else if (newStreak == 7 && previousStreak < 7) {
          celebrationModal = 'streak_7';
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final appState = ref.watch(appStateProvider);
    final todayStr = DateUtilsHelper.getTodayString();
    final todayData = appState.dailyHistory[todayStr];
    final todayCount = todayData?.count ?? 0;
    final streaks = appState.streaks;

    // Calculate lifetime total
    int lifetimeTotal = 0;
    for (final data in appState.dailyHistory.values) {
      lifetimeTotal += data.count;
    }

    // Calculate active days
    final activeDays = appState.dailyHistory.length;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Social Tracker',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Row(
                        children: [
                          // Streak badge
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.cardBackground,
                              border: Border.all(color: AppColors.border),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.local_fire_department,
                                  color: streaks.current > 0 ? AppColors.qualityOrange : AppColors.textTertiary,
                                  size: 16,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${streaks.current}',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: streaks.current > 0 ? AppColors.qualityOrange : AppColors.textTertiary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          // Settings button
                          InkWell(
                            onTap: () => setState(() => openModal = 'settings'),
                            onLongPress: () => _showTestMenu(context),
                            borderRadius: BorderRadius.circular(20),
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: AppColors.cardBackground,
                                border: Border.all(color: AppColors.border),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Icon(
                                Icons.settings,
                                color: AppColors.textSecondary,
                                size: 20,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Top Grid - Today and Lifetime
                  Row(
                    children: [
                      // Today Widget
                      Expanded(
                        child: _WidgetCard(
                          onTap: () => setState(() => openModal = 'today'),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(), // Spacer
                                  Icon(
                                    Icons.calendar_today,
                                    color: AppColors.textTertiary,
                                    size: 16,
                                  ),
                                ],
                              ),
                              const Spacer(),
                              Center(
                                child: SizedBox(
                                  width: 96,
                                  height: 96,
                                  child: Stack(
                                    children: [
                                      // Background circle
                                      CustomPaint(
                                        size: const Size(96, 96),
                                        painter: _CircleProgressPainter(
                                          progress: 0,
                                          color: AppColors.border,
                                        ),
                                      ),
                                      // Progress circle
                                      CustomPaint(
                                        size: const Size(96, 96),
                                        painter: _CircleProgressPainter(
                                          progress: math.min(todayCount / dailyGoalSetting, 1.0),
                                          color: Colors.white,
                                        ),
                                      ),
                                      // Count text
                                      Center(
                                        child: Text(
                                          '$todayCount',
                                          style: const TextStyle(
                                            fontSize: 40,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const Spacer(),
                              const Text(
                                'Today',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                'Daily interactions',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: AppColors.textTertiary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      // Lifetime Widget
                      Expanded(
                        child: _WidgetCard(
                          onTap: () => setState(() => openModal = 'lifetime'),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(), // Spacer
                                  Icon(
                                    Icons.people,
                                    color: AppColors.textTertiary,
                                    size: 16,
                                  ),
                                ],
                              ),
                              const Spacer(),
                              Center(
                                child: Column(
                                  children: [
                                    Text(
                                      '$lifetimeTotal',
                                      style: const TextStyle(
                                        fontSize: 48,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const Text(
                                      'Total',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: AppColors.textTertiary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const Spacer(),
                              const Text(
                                'Lifetime',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                'Total conversations',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: AppColors.textTertiary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Activity History Widget
                  _WidgetCard(
                    onTap: () => setState(() => openModal = 'activity'),
                    aspectRatio: null,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Activity History',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Past 90 days performance',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: AppColors.textTertiary,
                                  ),
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                _ColorDot(color: AppColors.border),
                                const SizedBox(width: 4),
                                _ColorDot(color: AppColors.emeraldDark),
                                const SizedBox(width: 4),
                                _ColorDot(color: AppColors.emerald),
                                const SizedBox(width: 4),
                                _ColorDot(color: AppColors.emeraldLight),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        // Dot Matrix
                        _DotMatrixWidget(history: appState.dailyHistory),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text(
                              '$activeDays ',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const Text(
                              'active days',
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.textTertiary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Notes History Widget
                  _WidgetCard(
                    onTap: () => setState(() => openModal = 'notes'),
                    aspectRatio: null,
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Notes History',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${_countNotes(appState.dailyHistory)} conversations',
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: AppColors.textTertiary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: AppColors.border,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(
                            Icons.message,
                            color: AppColors.textSecondary,
                            size: 16,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 100), // Space for FAB
                ],
              ),
            ),

            // Floating Action Button
            Positioned(
              bottom: 32,
              left: 0,
              right: 0,
              child: Center(
                child: InkWell(
                  onTap: () => setState(() => showQualitySlider = true),
                  borderRadius: BorderRadius.circular(32),
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppColors.cardBackground,
                      border: Border.all(color: AppColors.borderLight),
                      borderRadius: BorderRadius.circular(32),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.add,
                      color: Colors.white,
                      size: 32,
                    ),
                  ),
                ),
              ),
            ),

            // Quality Slider Modal
            if (showQualitySlider)
              _QualitySliderModal(
                quality: selectedQuality,
                note: note,
                onQualityChanged: (value) => setState(() => selectedQuality = value),
                onNoteChanged: (value) => setState(() => note = value),
                onConfirm: addInteraction,
                onCancel: () => setState(() => showQualitySlider = false),
              ),

            // Widget Modals
            if (openModal != null)
              _buildModalWidget(appState, todayCount, lifetimeTotal, activeDays),

            // Celebration Modals
            if (celebrationModal != null)
              _buildCelebrationModal(),
          ],
        ),
      ),
    );
  }

  Widget _buildCelebrationModal() {
    return GestureDetector(
      onTap: () => setState(() => celebrationModal = null),
      child: Container(
        color: Colors.black.withValues(alpha: 0.85),
        child: Center(
          child: Container(
            width: MediaQuery.of(context).size.width - 64,
            margin: const EdgeInsets.all(32),
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(24),
            ),
            child: _getCelebrationContent(),
          ),
        ),
      ),
    );
  }

  Widget _getCelebrationContent() {
    switch (celebrationModal) {
      case 'streak_7':
        return _buildStreakCelebration(7, '1 Week Streak!', '7 days in a row', 'Nice Work', AppColors.qualityOrange);
      case 'streak_30':
        return _buildStreakCelebration(30, '1 Month Streak!', '30 days in a row', 'Impressive', AppColors.qualityOrange);
      case 'streak_90':
        return _buildStreakCelebration(90, '90 Day Streak!', '3 months of dedication', 'Outstanding', AppColors.qualityOrange);
      case 'streak_180':
        return _buildStreakCelebration(180, '180 Day Streak!', '6 months of commitment', 'Exceptional', AppColors.qualityOrange);
      case 'streak_365':
        return _buildStreakCelebration(365, 'Legendary!', '365 days of pure dedication', 'Unstoppable', AppColors.qualityPurple);
      case 'new_best':
        final appState = ref.watch(appStateProvider);
        return _buildNewBestCelebration(appState.streaks.current);
      case 'goal_complete':
        return _buildGoalCompleteCelebration();
      default:
        return Container();
    }
  }

  Widget _buildStreakCelebration(int days, String title, String subtitle, String buttonText, Color color) {
    final isPurple = color == AppColors.qualityPurple;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Trophy icon with glow effect
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.3),
                blurRadius: 40,
                spreadRadius: 10,
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Icon(
                isPurple ? Icons.emoji_events : Icons.emoji_events_outlined,
                size: 80,
                color: Colors.white,
              ),
              if (isPurple)
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.star,
                      size: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
              if (days == 7)
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        Text(
          title,
          style: TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          style: const TextStyle(
            fontSize: 16,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => setState(() => celebrationModal = null),
            style: ElevatedButton.styleFrom(
              backgroundColor: color,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            child: Text(
              buttonText,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNewBestCelebration(int streakDays) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Trophy icon with glow effect
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.qualityOrange.withValues(alpha: 0.3),
                blurRadius: 40,
                spreadRadius: 10,
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              const Icon(
                Icons.emoji_events,
                size: 80,
                color: Colors.white,
              ),
              Positioned(
                top: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: AppColors.qualityOrange,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.star,
                    size: 16,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        const Text(
          'New Record!',
          style: TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.bold,
            color: AppColors.qualityOrange,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '$streakDays day streak — your best yet',
          style: const TextStyle(
            fontSize: 16,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => setState(() => celebrationModal = null),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.qualityOrange,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            child: const Text(
              'Keep it Burning',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGoalCompleteCelebration() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Trophy icon with glow effect
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.emerald.withValues(alpha: 0.3),
                blurRadius: 40,
                spreadRadius: 10,
              ),
            ],
          ),
          child: const Icon(
            Icons.emoji_events,
            size: 80,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 32),
        const Text(
          'Goal Complete!',
          style: TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.bold,
            color: AppColors.emerald,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'You reached your daily goal of ${dailyGoalSetting.toInt()} interactions',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 16,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => setState(() => celebrationModal = null),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.emerald,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            child: const Text(
              'Amazing!',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildModalWidget(dynamic appState, int todayCount, int lifetimeTotal, int activeDays) {
    return GestureDetector(
      onTap: () => setState(() => openModal = null),
      child: Container(
        color: Colors.black.withValues(alpha: 0.7),
        child: Center(
          child: GestureDetector(
            onTap: () {}, // Prevent dismissal when tapping modal
            child: Container(
              width: MediaQuery.of(context).size.width - 32,
              constraints: const BoxConstraints(maxHeight: 600),
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Close button
                  Align(
                    alignment: Alignment.topRight,
                    child: IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => setState(() => openModal = null),
                      color: AppColors.textSecondary,
                    ),
                  ),
                  // Modal content
                  Flexible(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                      child: _buildModalContent(appState, todayCount, lifetimeTotal, activeDays),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildModalContent(dynamic appState, int todayCount, int lifetimeTotal, int activeDays) {
    switch (openModal) {
      case 'today':
        return _buildTodayModal(todayCount);
      case 'lifetime':
        return _buildLifetimeModal(lifetimeTotal, activeDays, appState.dailyHistory);
      case 'activity':
        return _buildActivityModal(appState.dailyHistory, appState.streaks);
      case 'notes':
        return _buildNotesModal(appState.dailyHistory);
      case 'settings':
        return _buildSettingsModal();
      default:
        return Container();
    }
  }

  Widget _buildTodayModal(int todayCount) {
    final dailyGoal = dailyGoalSetting.toInt();
    final progress = math.min(todayCount / dailyGoal, 1.0);
    final remaining = math.max(dailyGoal - todayCount, 0);

    return Column(
      children: [
        Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(
                Icons.calendar_today,
                color: AppColors.textSecondary,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Today's Activity",
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Your daily progress',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 48),
        SizedBox(
          width: 192,
          height: 192,
          child: Stack(
            children: [
              CustomPaint(
                size: const Size(192, 192),
                painter: _CircleProgressPainter(progress: 1.0, color: AppColors.border),
              ),
              CustomPaint(
                size: const Size(192, 192),
                painter: _CircleProgressPainter(
                  progress: progress,
                  color: todayCount >= dailyGoal ? AppColors.emerald : Colors.white,
                ),
              ),
              Center(
                child: Text(
                  '$todayCount',
                  style: const TextStyle(
                    fontSize: 72,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 48),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.border.withValues(alpha: 0.5),
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Goal Progress',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textTertiary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${(progress * 100).toInt()}%',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      'Based on $dailyGoal/day',
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.border.withValues(alpha: 0.5),
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Remaining',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textTertiary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '$remaining',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const Text(
                      'To reach goal',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLifetimeModal(int lifetimeTotal, int activeDays, Map<String, dynamic> history) {
    final dailyAverage = activeDays > 0 ? (lifetimeTotal / activeDays).toStringAsFixed(1) : '0';

    return Column(
      children: [
        Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(
                Icons.people,
                color: AppColors.textSecondary,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Lifetime Stats',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'All-time achievements',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 48),
        Text(
          '$lifetimeTotal',
          style: const TextStyle(
            fontSize: 72,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const Text(
          'Total Conversations',
          style: TextStyle(
            fontSize: 20,
            color: AppColors.textTertiary,
          ),
        ),
        const SizedBox(height: 48),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.border.withValues(alpha: 0.5),
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Active Days',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textTertiary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '$activeDays',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const Text(
                      'Days tracked',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.border.withValues(alpha: 0.5),
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Daily Average',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textTertiary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      dailyAverage,
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const Text(
                      'Interactions/day',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActivityModal(Map<String, dynamic> history, dynamic streaks) {
    final activeDays = history.length;
    int bestDay = 0;
    for (final data in history.values) {
      if (data.count > bestDay) {
        bestDay = data.count;
      }
    }
    final consistency = ((activeDays / 90) * 100).toInt();

    // Get last 2 months for display
    final now = DateTime.now();
    final currentMonth = DateTime(now.year, now.month);
    final previousMonth = DateTime(now.year, now.month - 1);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(
                Icons.show_chart,
                color: AppColors.textSecondary,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Activity History',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  '90-day overview',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.border.withValues(alpha: 0.3),
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Expanded(
                child: _MonthCalendarWidget(
                  month: currentMonth,
                  history: history,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _MonthCalendarWidget(
                  month: previousMonth,
                  history: history,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.border.withValues(alpha: 0.5),
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text(
                      '$activeDays',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const Text(
                      'Active Days',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.border.withValues(alpha: 0.5),
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text(
                      '$bestDay',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const Text(
                      'Best Day',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.border.withValues(alpha: 0.5),
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text(
                      '$consistency%',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const Text(
                      'Consistency',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.border.withValues(alpha: 0.5),
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.local_fire_department,
                      color: AppColors.qualityOrange,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${streaks.longest}',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Longest Streak',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.border.withValues(alpha: 0.5),
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.local_fire_department,
                      color: AppColors.qualityOrange.withValues(alpha: 0.5),
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${streaks.current}',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Current Streak',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        // Intensity Legend
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.border.withValues(alpha: 0.3),
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Intensity Legend',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildIntensityLegendItem('None', AppColors.border),
                  _buildIntensityLegendItem('Low', AppColors.emeraldDark),
                  _buildIntensityLegendItem('Medium', AppColors.emerald),
                  _buildIntensityLegendItem('High', AppColors.emeraldLight),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildIntensityLegendItem(String label, Color color) {
    return Column(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }

  Widget _buildNotesModal(Map<String, dynamic> history) {
    final notes = <Map<String, dynamic>>[];

    for (final entry in history.entries) {
      final date = entry.key;
      final data = entry.value;
      if (data.entries != null) {
        for (final noteEntry in data.entries) {
          if (noteEntry.note.isNotEmpty) {
            notes.add({
              'date': date,
              'quality': noteEntry.quality,
              'note': noteEntry.note,
              'timestamp': noteEntry.timestamp,
            });
          }
        }
      }
    }

    notes.sort((a, b) => (b['timestamp'] as DateTime).compareTo(a['timestamp'] as DateTime));

    const qualityEmojis = ['', '😞', '😐', '🙂', '😊', '🤩'];
    const qualityTexts = ['', 'Poor', 'Okay', 'Good', 'Great', 'Amazing'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(
                Icons.message,
                color: AppColors.textSecondary,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Notes History',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'All your conversation notes',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 24),
        if (notes.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(48.0),
              child: Column(
                children: [
                  Icon(
                    Icons.message,
                    size: 64,
                    color: AppColors.textTertiary,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'No notes yet',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textTertiary,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Add notes to your interactions to see them here',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 10,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          ...notes.map((note) {
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.border.withValues(alpha: 0.5),
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        qualityEmojis[note['quality'] as int],
                        style: const TextStyle(fontSize: 32),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _formatNoteDate(note['timestamp'] as DateTime),
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              _formatNoteTime(note['timestamp'] as DateTime),
                              style: const TextStyle(
                                fontSize: 10,
                                color: AppColors.textTertiary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.border,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          qualityTexts[note['quality'] as int],
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    note['note'] as String,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            );
          }),
      ],
    );
  }

  Widget _buildSettingsModal() {
    return StatefulBuilder(
      builder: (context, setModalState) {
        return Column(
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Icon(
                    Icons.settings,
                    color: AppColors.textSecondary,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Settings',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      'Customize your goals',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.border.withValues(alpha: 0.3),
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Daily Goal',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Set your target number of daily interactions',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textTertiary,
                    ),
                  ),
                  const SizedBox(height: 32),
                  Center(
                    child: Column(
                      children: [
                        Text(
                          '${dailyGoalSetting.toInt()}',
                          style: const TextStyle(
                            fontSize: 56,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const Text(
                          'interactions per day',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  SliderTheme(
                    data: SliderThemeData(
                      activeTrackColor: Colors.white,
                      inactiveTrackColor: AppColors.border,
                      thumbColor: Colors.white,
                      overlayColor: Colors.white.withValues(alpha: 0.2),
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10),
                      trackHeight: 4,
                    ),
                    child: Slider(
                      value: dailyGoalSetting,
                      min: 1,
                      max: 50,
                      divisions: 49,
                      onChanged: (value) {
                        setModalState(() {
                          dailyGoalSetting = value;
                        });
                      },
                    ),
                  ),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '1',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textTertiary,
                        ),
                      ),
                      Text(
                        '50',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Quick presets:',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textTertiary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [5, 10, 15, 20].map((preset) {
                      final isSelected = dailyGoalSetting.toInt() == preset;
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: ElevatedButton(
                            onPressed: () {
                              setModalState(() {
                                dailyGoalSetting = preset.toDouble();
                              });
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isSelected ? Colors.white : AppColors.border,
                              foregroundColor: isSelected ? Colors.black : AppColors.textSecondary,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                            child: Text(
                              '$preset',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                onPressed: () {
                  // Save the setting and close modal
                  setState(() {
                    openModal = null;
                  });
                  // TODO: Save to SharedPreferences
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  elevation: 0,
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.check, size: 16),
                    SizedBox(width: 8),
                    Text(
                      'Save',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  String _formatNoteDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final dateOnly = DateTime(date.year, date.month, date.day);

    if (dateOnly == today) {
      return 'Today';
    } else if (dateOnly == yesterday) {
      return 'Yesterday';
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${monthNames[date.month - 1]} ${date.day}';
    }
  }

  String _formatNoteTime(DateTime date) {
    final hour = date.hour == 0 ? 12 : (date.hour > 12 ? date.hour - 12 : date.hour);
    final minute = date.minute.toString().padLeft(2, '0');
    final period = date.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }

  int _countNotes(Map<String, dynamic> history) {
    int count = 0;
    for (final data in history.values) {
      if (data.entries != null) {
        count += (data.entries as List).where((e) => e.note.isNotEmpty).length;
      }
    }
    return count;
  }

  // Developer test menu (long-press settings button)
  void _showTestMenu(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBackground,
        title: const Text(
          'Test Celebrations',
          style: TextStyle(color: Colors.white),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _testButton('7 Day Streak', () => setState(() => celebrationModal = 'streak_7')),
            _testButton('30 Day Streak', () => setState(() => celebrationModal = 'streak_30')),
            _testButton('90 Day Streak', () => setState(() => celebrationModal = 'streak_90')),
            _testButton('180 Day Streak', () => setState(() => celebrationModal = 'streak_180')),
            _testButton('365 Day Streak', () => setState(() => celebrationModal = 'streak_365')),
            _testButton('New Best Record', () => setState(() => celebrationModal = 'new_best')),
            _testButton('Goal Complete', () => setState(() => celebrationModal = 'goal_complete')),
          ],
        ),
      ),
    );
  }

  Widget _testButton(String label, VoidCallback onPressed) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            onPressed();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.border,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 12),
          ),
          child: Text(label),
        ),
      ),
    );
  }
}

// Widget Card - Reusable card component
class _WidgetCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final double? aspectRatio;

  const _WidgetCard({
    required this.child,
    this.onTap,
    this.aspectRatio = 1.0,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(24),
        ),
        child: aspectRatio != null
            ? AspectRatio(
                aspectRatio: aspectRatio!,
                child: child,
              )
            : child,
      ),
    );
  }
}

// Circle Progress Painter
class _CircleProgressPainter extends CustomPainter {
  final double progress;
  final Color color;

  _CircleProgressPainter({
    required this.progress,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 4;

    final paint = Paint()
      ..color = color
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    // Draw arc
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2, // Start from top
      2 * math.pi * progress,
      false,
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant _CircleProgressPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.color != color;
  }
}

// Color Dot - for legend
class _ColorDot extends StatelessWidget {
  final Color color;

  const _ColorDot({required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }
}

// Dot Matrix Widget - Activity visualization
class _DotMatrixWidget extends StatelessWidget {
  final Map<String, dynamic> history;

  const _DotMatrixWidget({required this.history});

  @override
  Widget build(BuildContext context) {
    const int weeks = 13;
    const int days = 7;
    final dates = _getPastDates(weeks * days);

    return Column(
      children: [
        // Labels
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            Text(
              '3 months ago',
              style: TextStyle(
                fontSize: 10,
                color: AppColors.textTertiary,
              ),
            ),
            Text(
              'Today',
              style: TextStyle(
                fontSize: 10,
                color: AppColors.textTertiary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Dot grid
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(weeks, (weekIndex) {
            return Padding(
              padding: EdgeInsets.symmetric(horizontal: weekIndex == 0 || weekIndex == weeks - 1 ? 0 : 2),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(days, (dayIndex) {
                  final dateIndex = weekIndex * days + dayIndex;
                  if (dateIndex >= dates.length) {
                    return const SizedBox(width: 8, height: 8);
                  }

                  final date = dates[dateIndex];
                  final data = history[date];
                  final count = data?.count ?? 0;

                  return Container(
                    width: 8,
                    height: 8,
                    margin: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: _getColorForCount(count),
                      shape: BoxShape.circle,
                    ),
                  );
                }),
              ),
            );
          }),
        ),
      ],
    );
  }

  List<String> _getPastDates(int days) {
    final dates = <String>[];
    final now = DateTime.now();

    for (int i = days - 1; i >= 0; i--) {
      final date = now.subtract(Duration(days: i));
      final dateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      dates.add(dateStr);
    }

    return dates;
  }

  Color _getColorForCount(int count) {
    if (count == 0) return AppColors.border;
    if (count <= 2) return AppColors.emeraldDark;
    if (count <= 5) return AppColors.emerald;
    return AppColors.emeraldLight;
  }
}

// Month Calendar Widget for Activity Modal
class _MonthCalendarWidget extends StatelessWidget {
  final DateTime month;
  final Map<String, dynamic> history;

  const _MonthCalendarWidget({
    required this.month,
    required this.history,
  });

  @override
  Widget build(BuildContext context) {
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    final monthName = '${monthNames[month.month]} ${month.year}';

    // Get all days in the month
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final firstDayOfMonth = DateTime(month.year, month.month, 1);

    // Calculate starting position (0 = Sunday)
    final startWeekday = firstDayOfMonth.weekday % 7;

    // Build calendar grid with proper 7-column layout
    final List<Widget> allDays = [];

    // Add empty spaces for days before month starts
    for (int i = 0; i < startWeekday; i++) {
      allDays.add(const SizedBox(width: 8, height: 8));
    }

    // Add actual days of the month
    for (int i = 0; i < daysInMonth; i++) {
      final day = i + 1;
      final date = DateTime(month.year, month.month, day);
      final dateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      final data = history[dateStr];
      final count = data?.count ?? 0;

      allDays.add(Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          color: _getColorForCount(count),
          shape: BoxShape.circle,
        ),
      ));
    }

    // Group into rows of 7
    final rows = <Widget>[];
    for (int i = 0; i < allDays.length; i += 7) {
      final rowItems = allDays.sublist(
        i,
        i + 7 > allDays.length ? allDays.length : i + 7,
      );

      rows.add(
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: rowItems,
        ),
      );

      if (i + 7 < allDays.length) {
        rows.add(const SizedBox(height: 4));
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          monthName,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(height: 12),
        // Calendar grid
        Column(
          mainAxisSize: MainAxisSize.min,
          children: rows,
        ),
      ],
    );
  }

  Color _getColorForCount(int count) {
    if (count == 0) return AppColors.border;
    if (count <= 2) return AppColors.emeraldDark;
    if (count <= 5) return AppColors.emerald;
    return AppColors.emeraldLight;
  }
}

class _QualitySliderModal extends StatelessWidget {
  final int quality;
  final String note;
  final ValueChanged<int> onQualityChanged;
  final ValueChanged<String> onNoteChanged;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const _QualitySliderModal({
    required this.quality,
    required this.note,
    required this.onQualityChanged,
    required this.onNoteChanged,
    required this.onConfirm,
    required this.onCancel,
  });

  static const qualityLabels = {
    1: {'emoji': '😞', 'text': 'Poor'},
    2: {'emoji': '😐', 'text': 'Okay'},
    3: {'emoji': '🙂', 'text': 'Good'},
    4: {'emoji': '😊', 'text': 'Great'},
    5: {'emoji': '🤩', 'text': 'Amazing'},
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withValues(alpha: 0.7),
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'How did it go?',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: onCancel,
                    color: AppColors.textSecondary,
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Emoji Display
              Text(
                qualityLabels[quality]!['emoji']!,
                style: const TextStyle(fontSize: 64),
              ),
              const SizedBox(height: 8),
              Text(
                qualityLabels[quality]!['text']!,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),

              const SizedBox(height: 32),

              // Slider
              Slider(
                value: quality.toDouble(),
                min: 1,
                max: 5,
                divisions: 4,
                onChanged: (value) => onQualityChanged(value.toInt()),
                activeColor: Colors.white,
                inactiveColor: AppColors.border,
              ),

              const SizedBox(height: 24),

              // Note Input
              TextField(
                onChanged: onNoteChanged,
                maxLength: 200,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'What did you talk about?',
                  hintStyle: const TextStyle(color: AppColors.textTertiary),
                  filled: true,
                  fillColor: AppColors.border,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
                style: const TextStyle(color: Colors.white),
              ),

              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onConfirm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check, size: 16),
                      SizedBox(width: 8),
                      Text(
                        'Log Interaction',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
