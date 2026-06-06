import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/empty_state.dart';
import '../widgets/loading_skeleton.dart';
import '../widgets/status_chip.dart';
import 'incident_detail_screen.dart';

/// Pantalla dedicada de historial — muestra servicios completados/cancelados
/// con resumen financiero, equivalente a la sección Historial del panel web.
class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<Incident> _all = [];
  bool _loading = true;
  String _role = 'client'; // se lee desde SharedPreferences al init

  List<Incident> get _history =>
      _all.where((i) => ['completed', 'cancelled'].contains(i.status)).toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

  // Métricas financieras — solo relevantes para talleres/técnicos.
  double get _totalEarned =>
      _history.fold(0.0, (sum, i) => sum + (i.finalCost ?? 0));
  double get _totalCommission => _totalEarned * 0.10;
  double get _netEarned => _totalEarned - _totalCommission;
  int get _completedCount =>
      _history.where((i) => i.status == 'completed').length;

  // Solo taller y técnico perciben ingresos — el cliente paga, no cobra.
  bool get _isWorkshop =>
      _role == 'workshop' || _role == 'technician';

  @override
  void initState() {
    super.initState();
    _loadRole();
    _load();
  }

  Future<void> _loadRole() async {
    final user = await ApiService.getCurrentUser();
    if (mounted && user != null) setState(() => _role = user.role);
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final incidents = await ApiService.getIncidents();
      if (mounted) setState(() => _all = incidents);
    } catch (_) {}
    finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: colors.background,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            pinned: true,
            floating: false,
            scrolledUnderElevation: 0.5,
            backgroundColor: colors.background,
            foregroundColor: colors.textPrimary,
            titleSpacing: AppSpacing.lg,
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Tus servicios',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  'Historial',
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: colors.textPrimary,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.4,
                  ),
                ),
              ],
            ),
          ),
          // Resumen: financiero solo para taller/técnico; contador simple para cliente.
          if (!_loading && _history.isNotEmpty)
            SliverToBoxAdapter(
              child: _isWorkshop
                  ? _buildWorkshopSummary(colors, theme)
                  : _buildClientSummary(colors, theme),
            ),
        ],
        body: _loading
            ? const Padding(
                padding: EdgeInsets.all(AppSpacing.lg),
                child: IncidentListSkeleton(),
              )
            : _history.isEmpty
                ? RefreshIndicator(
                    onRefresh: _load,
                    color: AppColors.primary,
                    child: ListView(
                      children: [
                        SizedBox(
                          height: 340,
                          child: EmptyState(
                            icon: Icons.history_rounded,
                            title: 'Sin historial',
                            subtitle:
                                'Tus servicios completados aparecerán aquí.',
                          ),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _load,
                    color: AppColors.primary,
                    child: ListView.builder(
                      padding: const EdgeInsets.fromLTRB(
                          AppSpacing.lg, AppSpacing.md, AppSpacing.lg, 100),
                      itemCount: _history.length,
                      itemBuilder: (context, index) {
                        return _HistoryCard(
                          incident: _history[index],
                          onTap: () async {
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => IncidentDetailScreen(
                                    incidentId: _history[index].id),
                              ),
                            );
                            _load();
                          },
                        )
                            .animate(delay: (40 * index).ms)
                            .fadeIn(duration: 300.ms)
                            .moveY(begin: 10, end: 0);
                      },
                    ),
                  ),
      ),
    );
  }

  /// Resumen para el cliente — muestra cuántos servicios ha recibido.
  Widget _buildClientSummary(AppColorsExtension colors, ThemeData theme) {
    final totalPaid = _history.fold(0.0, (sum, i) => sum + (i.finalCost ?? 0));
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.md),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1a1f2b), Color(0xFF14181f)],
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFF2a323f)),
        ),
        child: Row(
          children: [
            Expanded(
              child: _SummaryTile(
                label: 'Completados',
                value: '$_completedCount',
                icon: Icons.check_circle_rounded,
                color: AppColors.success,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: _SummaryTile(
                label: 'Cancelados',
                value: '${_history.where((i) => i.status == 'cancelled').length}',
                icon: Icons.cancel_rounded,
                color: AppColors.statusCancelled,
              ),
            ),
            if (totalPaid > 0) ...[
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _SummaryTile(
                  label: 'Total pagado',
                  value: 'Bs ${totalPaid.toStringAsFixed(0)}',
                  icon: Icons.payments_rounded,
                  color: AppColors.info,
                ),
              ),
            ],
          ],
        ),
      ).animate().fadeIn(duration: 400.ms).moveY(begin: 8, end: 0),
    );
  }

  /// Resumen financiero para talleres y técnicos.
  Widget _buildWorkshopSummary(AppColorsExtension colors, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.md),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1a1f2b), Color(0xFF14181f)],
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFF2a323f)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check_circle_rounded,
                      size: 13, color: AppColors.success),
                  const SizedBox(width: 4),
                  Text(
                    '$_completedCount completados',
                    style: const TextStyle(
                      color: AppColors.success,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: _SummaryTile(
                    label: 'Ingreso bruto',
                    value: 'Bs ${_totalEarned.toStringAsFixed(0)}',
                    icon: Icons.payments_rounded,
                    color: AppColors.info,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: _SummaryTile(
                    label: 'Comisión',
                    value: 'Bs ${_totalCommission.toStringAsFixed(0)}',
                    icon: Icons.receipt_long_rounded,
                    color: AppColors.warning,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: _SummaryTile(
                    label: 'Ganancia',
                    value: 'Bs ${_netEarned.toStringAsFixed(0)}',
                    icon: Icons.trending_up_rounded,
                    color: AppColors.success,
                  ),
                ),
              ],
            ),
          ],
        ),
      ).animate().fadeIn(duration: 400.ms).moveY(begin: 8, end: 0),
    );
  }
}

class _SummaryTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _SummaryTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm, vertical: AppSpacing.sm),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 14,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.3,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFF8b949e),
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final Incident incident;
  final VoidCallback onTap;

  const _HistoryCard({required this.incident, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isCompleted = incident.status == 'completed';
    final accentColor =
        isCompleted ? AppColors.success : AppColors.statusCancelled;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        decoration: BoxDecoration(
          color: context.appColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: context.appColors.border),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              // Ícono de estado
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  isCompleted
                      ? Icons.check_circle_rounded
                      : Icons.cancel_rounded,
                  color: accentColor,
                  size: 22,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        StatusChip.category(incident.category),
                        const SizedBox(width: 6),
                        Text(
                          '#${incident.id}',
                          style: TextStyle(
                            color: context.appColors.textTertiary,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      incident.aiSummary ??
                          incident.description ??
                          'Sin descripción',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: context.appColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatDate(incident.createdAt as String),
                      style: TextStyle(
                        color: context.appColors.textTertiary,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              // Costo
              if (incident.finalCost != null && incident.finalCost! > 0) ...[
                const SizedBox(width: AppSpacing.sm),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Bs ${incident.finalCost!.toStringAsFixed(0)}',
                      style: TextStyle(
                        color: accentColor,
                        fontWeight: FontWeight.w800,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      'total',
                      style: TextStyle(
                        color: context.appColors.textTertiary,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ] else
                Icon(
                  Icons.chevron_right_rounded,
                  color: context.appColors.textTertiary,
                  size: 20,
                ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(String isoStr) {
    try {
      final dt = DateTime.parse(isoStr).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt).inDays;
      if (diff == 0) return 'Hoy';
      if (diff == 1) return 'Ayer';
      if (diff < 7) return 'Hace $diff días';
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return isoStr.substring(0, 10);
    }
  }
}
