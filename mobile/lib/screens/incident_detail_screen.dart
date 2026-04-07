import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/app_card.dart';
import '../widgets/app_snackbar.dart';
import '../widgets/empty_state.dart';
import '../widgets/status_chip.dart';

class IncidentDetailScreen extends StatefulWidget {
  final int incidentId;
  const IncidentDetailScreen({super.key, required this.incidentId});

  @override
  State<IncidentDetailScreen> createState() => _IncidentDetailScreenState();
}

class _IncidentDetailScreenState extends State<IncidentDetailScreen> {
  Incident? _incident;
  bool _loading = true;
  bool _paying = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final inc = await ApiService.getIncident(widget.incidentId);
      if (mounted) setState(() => _incident = inc);
    } catch (_) {
      if (mounted) {
        AppSnackBar.error(context, 'Error al cargar incidente');
      }
    }
    if (mounted) setState(() => _loading = false);
  }

  static const _statusLabels = {
    'pending': 'Pendiente',
    'assigned': 'Taller asignado',
    'in_progress': 'En proceso',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
  };

  static const _categoryLabels = {
    'battery': 'Problema de bateria',
    'tire': 'Pinchazo de llanta',
    'crash': 'Accidente / choque',
    'engine': 'Problema de motor',
    'keys': 'Problema de llaves',
    'other': 'Otro',
    'uncertain': 'Sin clasificar',
  };

  IconData _statusIcon(String status) {
    switch (status) {
      case 'completed':
        return Icons.check_circle_rounded;
      case 'in_progress':
        return Icons.build_circle_rounded;
      case 'assigned':
        return Icons.handshake_rounded;
      case 'cancelled':
        return Icons.cancel_rounded;
      default:
        return Icons.schedule_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Incidente #${widget.incidentId}'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : _incident == null
              ? const EmptyState(
                  icon: Icons.error_outline_rounded,
                  title: 'Incidente no encontrado',
                  subtitle: 'No pudimos obtener la informacion solicitada.',
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  color: AppColors.primary,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    children: [
                      _buildStatusHero(),
                      const SizedBox(height: AppSpacing.md),
                      _buildAICard(),
                      const SizedBox(height: AppSpacing.md),
                      _buildInfoCard(),
                      if (_incident!.evidences.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.md),
                        _buildEvidencesCard(),
                      ],
                      if (_incident!.finalCost != null) ...[
                        const SizedBox(height: AppSpacing.md),
                        _buildPaymentCard(),
                      ],
                      const SizedBox(height: AppSpacing.lg),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStatusHero() {
    final inc = _incident!;
    final color = AppColors.getStatusColor(inc.status);
    return AppCard(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [color, color.withValues(alpha: 0.75)],
      ),
      padding: const EdgeInsets.all(AppSpacing.lg + 4),
      child: Column(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withValues(alpha: 0.2),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.4),
                width: 2,
              ),
            ),
            child: Icon(
              _statusIcon(inc.status),
              size: 40,
              color: Colors.white,
            ),
          )
              .animate()
              .scale(
                duration: 500.ms,
                curve: Curves.easeOutBack,
                begin: const Offset(0.5, 0.5),
              )
              .fadeIn(),
          const SizedBox(height: AppSpacing.md),
          Text(
            _statusLabels[inc.status] ?? inc.status,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
          ),
          if (inc.estimatedArrival != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: 6,
              ),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(AppRadius.pill),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.timer_rounded,
                    size: 16,
                    color: Colors.white,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'ETA ${inc.estimatedArrival} min',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).moveY(begin: 16, end: 0);
  }

  Widget _buildAICard() {
    final inc = _incident!;
    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.info.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  color: AppColors.info,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Analisis de IA',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              StatusChip.priority(inc.priority),
              StatusChip.category(inc.category),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          _detailRow('Categoria',
              _categoryLabels[inc.category] ?? inc.category),
          if (inc.aiSummary != null)
            _detailRow('Resumen', inc.aiSummary!),
          if (inc.aiDiagnosis != null)
            _detailRow('Diagnostico', inc.aiDiagnosis!),
        ],
      ),
    ).animate(delay: 100.ms).fadeIn().moveY(begin: 16, end: 0);
  }

  Widget _buildInfoCard() {
    final inc = _incident!;
    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: const Icon(
                  Icons.info_outline_rounded,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Informacion',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          _detailRow(
            'Ubicacion',
            inc.address ??
                '${inc.latitude.toStringAsFixed(4)}, ${inc.longitude.toStringAsFixed(4)}',
          ),
          if (inc.description != null)
            _detailRow('Descripcion', inc.description!),
        ],
      ),
    ).animate(delay: 200.ms).fadeIn().moveY(begin: 16, end: 0);
  }

  Widget _buildEvidencesCard() {
    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: const Icon(
                  Icons.collections_rounded,
                  color: AppColors.accent,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Evidencias',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          ..._incident!.evidences.map((ev) {
            if (ev.type == 'image' && ev.fileUrl != null) {
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  child: Image.network(
                    'http://10.0.2.2:8000${ev.fileUrl}',
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 120,
                      color: AppColors.surfaceAlt,
                      child: const Center(
                        child: Icon(
                          Icons.broken_image_rounded,
                          size: 48,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            } else if (ev.type == 'audio') {
              return Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.surfaceAlt,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: const Icon(
                        Icons.audiotrack_rounded,
                        color: AppColors.accent,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Audio',
                            style: TextStyle(fontWeight: FontWeight.w600),
                          ),
                          Text(
                            ev.transcription != null
                                ? 'Transcripcion: ${ev.transcription}'
                                : 'Procesando...',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textTertiary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            } else if (ev.type == 'text') {
              return Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.surfaceAlt,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.text_snippet_rounded,
                      color: AppColors.info,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(child: Text(ev.content ?? '')),
                  ],
                ),
              );
            }
            return const SizedBox.shrink();
          }),
        ],
      ),
    ).animate(delay: 300.ms).fadeIn().moveY(begin: 16, end: 0);
  }

  Widget _buildPaymentCard() {
    final inc = _incident!;
    return AppCard(
      gradient: AppColors.successGradient,
      padding: const EdgeInsets.all(AppSpacing.lg + 4),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: const Icon(
              Icons.payments_rounded,
              size: 32,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Total a pagar',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withValues(alpha: 0.9),
                ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Bs. ${inc.finalCost!.toStringAsFixed(2)}',
            style: Theme.of(context).textTheme.displayMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _paying ? null : _pay,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppColors.success,
              ),
              icon: _paying
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: AppColors.success,
                      ),
                    )
                  : const Icon(Icons.check_rounded),
              label: Text(_paying ? 'Procesando...' : 'Realizar pago'),
            ),
          ),
        ],
      ),
    ).animate(delay: 400.ms).fadeIn().moveY(begin: 16, end: 0);
  }

  Future<void> _pay() async {
    if (_incident?.finalCost == null) return;
    setState(() => _paying = true);
    try {
      await ApiService.createPayment(
        incidentId: _incident!.id,
        amount: _incident!.finalCost!,
      );
      if (mounted) {
        AppSnackBar.success(context, 'Pago realizado exitosamente');
      }
    } catch (e) {
      if (mounted) {
        AppSnackBar.error(
          context,
          e.toString().replaceAll('Exception: ', ''),
        );
      }
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: AppColors.textTertiary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
