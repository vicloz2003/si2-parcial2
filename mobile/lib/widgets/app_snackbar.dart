import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/// SnackBars consistentes para feedback al usuario.
class AppSnackBar {
  AppSnackBar._();

  static void show(
    BuildContext context, {
    required String message,
    IconData? icon,
    Color? color,
  }) {
    final c = color ?? context.appColors.textPrimary;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        margin: const EdgeInsets.all(AppSpacing.md),
        behavior: SnackBarBehavior.floating,
        backgroundColor: c,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        content: Row(
          children: [
            if (icon != null) ...[
              Icon(icon, color: Colors.white, size: 22),
              const SizedBox(width: AppSpacing.sm),
            ],
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  static void success(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.check_circle_rounded,
      color: AppColors.success,
    );
  }

  static void error(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.error_rounded,
      color: AppColors.danger,
    );
  }

  static void info(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.info_rounded,
      color: AppColors.info,
    );
  }

  /// Version that takes a pre-captured [ScaffoldMessengerState] so it can be
  /// called safely after an async gap without holding a [BuildContext].
  static void showOn(
    ScaffoldMessengerState messenger,
    String message, {
    bool isError = false,
  }) {
    final color = isError ? AppColors.danger : AppColors.success;
    final icon = isError ? Icons.error_rounded : Icons.check_circle_rounded;
    messenger.showSnackBar(
      SnackBar(
        margin: const EdgeInsets.all(AppSpacing.md),
        behavior: SnackBarBehavior.floating,
        backgroundColor: color,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        content: Row(
          children: [
            Icon(icon, color: Colors.white, size: 22),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }
}
