import 'package:flutter/material.dart';

class AppColors {
  // Background colors matching the dark theme
  static const Color background = Color(0xFF0A0A0A);
  static const Color cardBackground = Color(0xFF1A1A1A);
  static const Color inputBackground = Color(0xFF0F0F0F);

  // Border colors
  static const Color border = Color(0xFF2A2A2A);
  static const Color borderLight = Color(0xFF3A3A3A);

  // Text colors
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Color(0xFF999999);
  static const Color textTertiary = Color(0xFF666666);

  // Accent colors
  static const Color accent = Colors.white;
  static const Color emerald = Color(0xFF10B981);
  static const Color emeraldDark = Color(0xFF065F46);
  static const Color emeraldLight = Color(0xFF34D399);
  static const Color teal = Color(0xFF14B8A6);
  static const Color cyan = Color(0xFF06B6D4);

  // Gradient colors for logo/effects
  static const LinearGradient logoGradient = LinearGradient(
    colors: [
      Color(0xFF60A5FA), // blue
      Color(0xFFA78BFA), // purple
      Color(0xFFF472B6), // pink
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Quality colors (for streak celebrations)
  static const Color qualityGold = Color(0xFFFBBF24);
  static const Color qualityPurple = Color(0xFFA855F7);
  static const Color qualityOrange = Color(0xFFFF6B35);
}
