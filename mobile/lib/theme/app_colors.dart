import 'package:flutter/material.dart';

/// Sistema de colores centralizado para EmergenciApp.
class AppColors {
  AppColors._();

  // Marca
  static const Color primary = Color(0xFF1E3A5F);
  static const Color primaryDark = Color(0xFF0D1B2A);
  static const Color primaryLight = Color(0xFF2D5A8C);
  static const Color accent = Color(0xFFFF6B35);

  // Emergencia
  static const Color emergency = Color(0xFFE63946);
  static const Color emergencyDark = Color(0xFFC1121F);

  // Estados
  static const Color success = Color(0xFF06A77D);
  static const Color warning = Color(0xFFF77F00);
  static const Color info = Color(0xFF3A86FF);
  static const Color danger = Color(0xFFE63946);

  // Prioridades
  static const Color priorityLow = Color(0xFF06A77D);
  static const Color priorityMedium = Color(0xFFF77F00);
  static const Color priorityHigh = Color(0xFFE63946);
  static const Color priorityCritical = Color(0xFF8B0000);

  // Estados de incidente
  static const Color statusPending = Color(0xFFF77F00);
  static const Color statusAssigned = Color(0xFF3A86FF);
  static const Color statusInProgress = Color(0xFF00B4D8);
  static const Color statusCompleted = Color(0xFF06A77D);
  static const Color statusCancelled = Color(0xFF6C757D);

  // Superficies
  static const Color background = Color(0xFFF5F7FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceAlt = Color(0xFFF0F2F5);

  // Texto
  static const Color textPrimary = Color(0xFF1A202C);
  static const Color textSecondary = Color(0xFF4A5568);
  static const Color textTertiary = Color(0xFF718096);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // Bordes
  static const Color border = Color(0xFFE2E8F0);
  static const Color divider = Color(0xFFEDF2F7);

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

  static const LinearGradient successGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF06A77D), Color(0xFF048A65)],
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
