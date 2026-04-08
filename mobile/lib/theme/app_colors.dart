import 'package:flutter/material.dart';

/// Sistema de colores centralizado para EmergenciApp — Logo palette.
class AppColors {
  AppColors._();

  // Marca — colores del logo
  static const Color primary = Color(0xFF007AFF); // Azul Eléctrico
  static const Color primaryDark = Color(0xFF1C2B39); // Azul Marino Oscuro
  static const Color primaryLight = Color(0xFF1E88E5); // Azul claro
  static const Color accent = Color(0xFFFF7A00); // Naranja Vibrante

  // Emergencia
  static const Color emergency = Color(0xFFE53E3E);
  static const Color emergencyDark = Color(0xFFB91C1C);

  // Estados
  static const Color success = Color(0xFF0FAD73);
  static const Color warning = Color(0xFFFF7A00);
  static const Color info = Color(0xFF007AFF);
  static const Color danger = Color(0xFFE53E3E);

  // Prioridades
  static const Color priorityLow = Color(0xFF0FAD73);
  static const Color priorityMedium = Color(0xFFFF7A00);
  static const Color priorityHigh = Color(0xFFE53E3E);
  static const Color priorityCritical = Color(0xFF991B1B);

  // Estados de incidente
  static const Color statusPending = Color(0xFFFF7A00);
  static const Color statusAssigned = Color(0xFF007AFF);
  static const Color statusInProgress = Color(0xFF1E88E5);
  static const Color statusCompleted = Color(0xFF0FAD73);
  static const Color statusCancelled = Color(0xFF6B7280);

  // Superficies — Light
  static const Color background = Color(0xFFF8F9FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceAlt = Color(0xFFF0F2F5);

  // Superficies — Dark
  static const Color backgroundDark = Color(0xFF0D1117);
  static const Color surfaceDark = Color(0xFF161B22);
  static const Color surfaceAltDark = Color(0xFF1C2128);

  // Texto — Light
  static const Color textPrimary = Color(0xFF1C2B39);
  static const Color textSecondary = Color(0xFF546E7A);
  static const Color textTertiary = Color(0xFF8C95A8);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // Texto — Dark
  static const Color textPrimaryDark = Color(0xFFE6EDF3);
  static const Color textSecondaryDark = Color(0xFF8B949E);
  static const Color textTertiaryDark = Color(0xFF6E7681);

  // Bordes — Light
  static const Color border = Color(0xFFDFE2EA);
  static const Color divider = Color(0xFFEEF0F4);

  // Bordes — Dark
  static const Color borderDark = Color(0xFF30363D);
  static const Color dividerDark = Color(0xFF21262D);

  // Gradientes
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryDark],
  );

  static const LinearGradient emergencyGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [emergency, emergencyDark],
  );

  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFF7A00), Color(0xFFFF8C00)],
  );

  static const LinearGradient successGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0FAD73), Color(0xFF059669)],
  );

  // Helpers para estados
  static Color getPriorityColor(String priority) {
    switch (priority.toLowerCase()) {
      case 'low':
        return priorityLow;
      case 'medium':
        return priorityMedium;
      case 'high':
        return priorityHigh;
      case 'critical':
        return priorityCritical;
      default:
        return textTertiary;
    }
  }

  static Color getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return statusPending;
      case 'assigned':
        return statusAssigned;
      case 'in_progress':
        return statusInProgress;
      case 'completed':
        return statusCompleted;
      case 'cancelled':
        return statusCancelled;
      default:
        return textTertiary;
    }
  }
}

/// Extension de colores que se adapta al tema actual (light / dark).
@immutable
class AppColorsExtension extends ThemeExtension<AppColorsExtension> {
  final Color background;
  final Color surface;
  final Color surfaceAlt;
  final Color textPrimary;
  final Color textSecondary;
  final Color textTertiary;
  final Color border;
  final Color divider;

  const AppColorsExtension({
    required this.background,
    required this.surface,
    required this.surfaceAlt,
    required this.textPrimary,
    required this.textSecondary,
    required this.textTertiary,
    required this.border,
    required this.divider,
  });

  static const light = AppColorsExtension(
    background: AppColors.background,
    surface: AppColors.surface,
    surfaceAlt: AppColors.surfaceAlt,
    textPrimary: AppColors.textPrimary,
    textSecondary: AppColors.textSecondary,
    textTertiary: AppColors.textTertiary,
    border: AppColors.border,
    divider: AppColors.divider,
  );

  static const dark = AppColorsExtension(
    background: AppColors.backgroundDark,
    surface: AppColors.surfaceDark,
    surfaceAlt: AppColors.surfaceAltDark,
    textPrimary: AppColors.textPrimaryDark,
    textSecondary: AppColors.textSecondaryDark,
    textTertiary: AppColors.textTertiaryDark,
    border: AppColors.borderDark,
    divider: AppColors.dividerDark,
  );

  @override
  AppColorsExtension copyWith({
    Color? background,
    Color? surface,
    Color? surfaceAlt,
    Color? textPrimary,
    Color? textSecondary,
    Color? textTertiary,
    Color? border,
    Color? divider,
  }) {
    return AppColorsExtension(
      background: background ?? this.background,
      surface: surface ?? this.surface,
      surfaceAlt: surfaceAlt ?? this.surfaceAlt,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textTertiary: textTertiary ?? this.textTertiary,
      border: border ?? this.border,
      divider: divider ?? this.divider,
    );
  }

  @override
  AppColorsExtension lerp(covariant AppColorsExtension? other, double t) {
    if (other is! AppColorsExtension) return this;
    return AppColorsExtension(
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceAlt: Color.lerp(surfaceAlt, other.surfaceAlt, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textTertiary: Color.lerp(textTertiary, other.textTertiary, t)!,
      border: Color.lerp(border, other.border, t)!,
      divider: Color.lerp(divider, other.divider, t)!,
    );
  }
}

/// Acceso rápido: context.appColors.background, .surface, etc.
extension AppColorsX on BuildContext {
  AppColorsExtension get appColors =>
      Theme.of(this).extension<AppColorsExtension>()!;
}
