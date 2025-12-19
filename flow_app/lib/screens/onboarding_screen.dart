import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/app_colors.dart';
import '../providers/app_state_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int currentStep = 0;
  String? selectedMind;
  String? selectedAge;
  String? selectedGoal;

  final screens = [
    {
      'question': "What's on your mind?",
      'subtitle': 'Your answers will help shape the app around your needs.',
      'options': [
        'Elevate mood',
        'Reduce stress & anxiety',
        'Improve sleep',
        'Increase productivity',
      ],
    },
    {
      'question': 'How old are you?',
      'subtitle': 'Your answers will help shape the app around your needs.',
      'options': [
        'Under 18',
        '18-24',
        '25-34',
        '35-44',
      ],
    },
    {
      'question': "What's your main goal?",
      'subtitle': 'Your answers will help shape the app around your needs.',
      'options': [
        'Build better habits',
        'Track my progress',
        'Stay consistent',
        'Achieve goals faster',
      ],
    },
  ];

  String? getSelected() {
    switch (currentStep) {
      case 0: return selectedMind;
      case 1: return selectedAge;
      case 2: return selectedGoal;
      default: return null;
    }
  }

  void setSelected(String value) {
    setState(() {
      switch (currentStep) {
        case 0: selectedMind = value; break;
        case 1: selectedAge = value; break;
        case 2: selectedGoal = value; break;
      }
    });
  }

  void nextStep() {
    if (currentStep < 2) {
      setState(() {
        currentStep++;
      });
    } else {
      ref.read(appStateProvider.notifier).navigateToScreen(AppScreen.paywall);
    }
  }

  void prevStep() {
    if (currentStep > 0) {
      setState(() {
        currentStep--;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentScreen = screens[currentStep];
    final selected = getSelected();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: Container(
                    key: ValueKey(currentStep),
                    decoration: BoxDecoration(
                      color: AppColors.cardBackground,
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Column(
                      children: [
                        // Header
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: const BoxDecoration(
                            border: Border(bottom: BorderSide(color: AppColors.border)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              if (currentStep > 0)
                                IconButton(
                                  icon: const Icon(Icons.chevron_left),
                                  onPressed: prevStep,
                                  color: AppColors.textSecondary,
                                )
                              else
                                const SizedBox(width: 48),
                              TextButton(
                                onPressed: () => ref.read(appStateProvider.notifier).navigateToScreen(AppScreen.paywall),
                                child: const Text(
                                  'Skip',
                                  style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.1,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Content
                        Expanded(
                          child: SingleChildScrollView(
                            padding: const EdgeInsets.all(32),
                            child: Column(
                              children: [
                                Text(
                                  currentScreen['question'] as String,
                                  style: const TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                    height: 1.3,
                                    letterSpacing: -0.5,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  currentScreen['subtitle'] as String,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w400,
                                    color: AppColors.textSecondary,
                                    height: 1.5,
                                    letterSpacing: 0.1,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 32),

                                // Options
                                ...((currentScreen['options'] as List<String>).map((option) {
                                  final isSelected = selected == option;
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: Material(
                                      color: Colors.transparent,
                                      child: InkWell(
                                        onTap: () => setSelected(option),
                                        borderRadius: BorderRadius.circular(16),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
                                          decoration: BoxDecoration(
                                            color: isSelected ? Colors.white : AppColors.inputBackground,
                                            border: Border.all(
                                              color: isSelected ? Colors.white : AppColors.border,
                                            ),
                                            borderRadius: BorderRadius.circular(16),
                                          ),
                                          child: Text(
                                            option,
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w600,
                                              color: isSelected ? Colors.black : Colors.white,
                                              height: 1.4,
                                              letterSpacing: 0.1,
                                            ),
                                            textAlign: TextAlign.center,
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                })),

                                const SizedBox(height: 24),

                                Text(
                                  "Your selections won't limit access to any features.",
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w400,
                                    color: AppColors.textSecondary.withValues(alpha: 0.6),
                                    height: 1.5,
                                    letterSpacing: 0.1,
                                  ),
                                  textAlign: TextAlign.center,
                                ),

                                const SizedBox(height: 24),

                                // Continue Button
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: selected != null ? nextStep : null,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.white,
                                      foregroundColor: Colors.black,
                                      disabledBackgroundColor: Colors.white.withValues(alpha: 0.5),
                                      disabledForegroundColor: Colors.black.withValues(alpha: 0.5),
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      elevation: 0,
                                    ),
                                    child: const Text(
                                      'Continue',
                                      style: TextStyle(
                                        fontSize: 17,
                                        fontWeight: FontWeight.w700,
                                        height: 1.3,
                                        letterSpacing: 0.2,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Progress Indicators
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(3, (index) {
                  return Container(
                    width: 32,
                    height: 4,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      color: index == currentStep
                          ? Colors.white
                          : index < currentStep
                              ? AppColors.textSecondary
                              : AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
