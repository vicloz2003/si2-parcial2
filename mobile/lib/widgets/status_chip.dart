import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/// Chip de estado con color suave y texto bold.
class StatusChip extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;
  final bool filled;

  const StatusChip({
    super.key,
    required this.label,
    required this.color,
    this.icon,
    this.filled = false,
  });

  factory StatusChip.priority(String priority) {
    final color = AppColors.getPriorityColor(priority);
    final labels = {
      'low': 'BAJA',
      'medium': 'MEDIA',
      'high': 'ALTA',
      'critical': 'CRITICA',
    };
    return StatusChip(
      label: labels[priority.toLowerCase()] ?? priority.toUpperCase(),
      color: color,
      filled: true,
    );
  }

  factory StatusChip.status(String status) {
    final color = AppColors.getStatusColor(status);
    final labels = {
      'pending': 'Pendiente',
      'assigned': 'Asignado',
      'in_progress': 'En proceso',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
    };
    final icons = {
      'pending': Icons.schedule_rounded,
      'assigned': Icons.handshake_rounded,
      'in_progress': Icons.build_circle_rounded,
      'completed': Icons.check_circle_rounded,
      'cancelled': Icons.cancel_rounded,
    };
    return StatusChip(
      label: labels[status.toLowerCase()] ?? status,
      color: color,
      icon: icons[status.toLowerCase()],
    );
  }

  factory StatusChip.category(String category) {
    final labels = {
      'battery': 'Bateria',
      'tire': 'Llanta',
      'crash': 'Choque',
      'engine': 'Motor',
      'keys': 'Llaves',
      'other': 'Otro',
      'uncertain': 'Sin clasificar',
    };
    final icons = {
      'battery': Icons.battery_alert_rounded,
      'tire': Icons.tire_repair_rounded,
      'crash': Icons.car_crash_rounded,
      'engine': Icons.settings_rounded,
      'keys': Icons.key_rounded,
      'other': Icons.help_outline_rounded,
      'uncertain': Icons.psychology_rounded,
    };
    return StatusChip(
      label: labels[category.toLowerCase()] ?? category,
      color: AppColors.primary,
      icon: icons[category.toLowerCase()],
    );
  }

  @override
  Widget build(BuildContext context) {
    final bg = filled ? color : color.withValues(alpha: 0.12);
    final fg = filled ? Colors.white : color;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: fg,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}
