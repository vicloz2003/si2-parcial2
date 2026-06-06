import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/offline/connectivity_service.dart';
import '../services/offline/sync_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/empty_state.dart';
import '../widgets/loading_skeleton.dart';
import '../widgets/rescateya_logo.dart';
import '../widgets/status_chip.dart';
import 'new_emergency_screen.dart';
import 'incident_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  List<Incident> _incidents = [];
  bool _loading = true;
  int _pendingSync = 0;
  bool _offline = false;
  StreamSubscription? _syncSub;
  StreamSubscription<bool>? _connSub;
  late TabController _tabController;

  // Activas: pendientes + asignadas + en proceso. Historial: completadas + canceladas.
  List<Incident> get _active => _incidents
      .where((i) =>
          ['pending', 'assigned', 'in_progress'].contains(i.status))
      .toList();
  List<Incident> get _history => _incidents
      .where((i) => ['completed', 'cancelled'].contains(i.status))
      .toList();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
    _refreshSyncState();
    _offline = !ConnectivityService.instance.isOnline;
    _syncSub = SyncService.instance.onChange.listen((_) {
      _refreshSyncState();
      _loadData();
    });
    _connSub = ConnectivityService.instance.onStatusChange.listen((online) {
      if (mounted) setState(() => _offline = !online);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _syncSub?.cancel();
    _connSub?.cancel();
    super.dispose();
  }

  Future<void> _refreshSyncState() async {
    final pending = await SyncService.instance.pendingCount();
    if (mounted) setState(() => _pendingSync = pending);
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final incidents = await ApiService.getIncidents();
      if (!mounted) return;
      setState(() => _incidents = incidents);
    } catch (_) {}
    finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _goToNewEmergency() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const NewEmergencyScreen()),
    );
    if (result == true) _loadData();
  }

  // ── Banner de conectividad / sincronización ──
  Widget _buildSyncBanner() {
    if (!_offline && _pendingSync == 0) return const SizedBox.shrink();
    final color = _offline ? AppColors.warning : AppColors.primary;
    final icon = _offline ? Icons.cloud_off_rounded : Icons.sync_rounded;
    final text = _offline
        ? (_pendingSync > 0
            ? 'Sin conexion · $_pendingSync emergencia(s) pendiente(s)'
            : 'Sin conexion')
        : 'Sincronizando $_pendingSync emergencia(s)...';
    return Container(
      width: double.infinity,
      color: color.withValues(alpha: 0.12),
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(text,
                style: TextStyle(
                    color: color, fontWeight: FontWeight.w700, fontSize: 12)),
          ),
          if (!_offline && _pendingSync > 0)
            SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(
                  strokeWidth: 2, color: color),
            ),
        ],
      ),
    );
  }

  // ── Hero SOS ──
  Widget _buildSosHero() {
    final hasActive = _active.isNotEmpty;
    return Container(
      margin: const EdgeInsets.fromLTRB(
          AppSpacing.lg, AppSpacing.md, AppSpacing.lg, 0),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1a1f2b), Color(0xFF14181f)],
        ),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFF2a323f), width: 1),
      ),
      child: Stack(
        children: [
          // Glow decorativo
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [
                  AppColors.primary.withValues(alpha: 0.18),
                  Colors.transparent,
                ]),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Row(
              children: [
                // Texto + botón
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        hasActive
                            ? 'Tienes ${_active.length} solicitud${_active.length > 1 ? 'es' : ''} activa${_active.length > 1 ? 's' : ''}'
                            : 'Todo en orden',
                        style: const TextStyle(
                          color: Color(0xFF8b949e),
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.3,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        '¿Necesitas ayuda?',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      // Botón SOS
                      GestureDetector(
                        onTap: _goToNewEmergency,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF111111),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.28),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(Icons.warning_amber_rounded,
                                  color: Colors.white, size: 20),
                              SizedBox(width: 8),
                              Text(
                                'Pedir auxilio',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 15,
                                  letterSpacing: 0.2,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ).animate().scale(
                            duration: 200.ms,
                            curve: Curves.easeOut,
                          ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.lg),
                // Logo baliza (decorativo)
                const RescateYaLogo(size: 72, pulse: false),
              ],
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 500.ms)
        .moveY(begin: 12, end: 0, curve: Curves.easeOut);
  }

  // ── Fila de stats rápidas ──
  Widget _buildStatsRow() {
    final active = _active.length;
    final inProgress =
        _incidents.where((i) => i.status == 'in_progress').length;
    final completed = _history
        .where((i) => i.status == 'completed')
        .length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg, AppSpacing.md, AppSpacing.lg, 0),
      child: Row(
        children: [
          _StatBadge(
            label: 'Activas',
            count: active,
            color: AppColors.primary,
            icon: Icons.schedule_rounded,
          ),
          const SizedBox(width: AppSpacing.sm),
          _StatBadge(
            label: 'En proceso',
            count: inProgress,
            color: AppColors.warning,
            icon: Icons.build_rounded,
          ),
          const SizedBox(width: AppSpacing.sm),
          _StatBadge(
            label: 'Completadas',
            count: completed,
            color: AppColors.success,
            icon: Icons.check_circle_rounded,
          ),
        ],
      ),
    ).animate(delay: 100.ms).fadeIn().moveY(begin: 8, end: 0);
  }

  // ── Tab bar Activas / Historial ──
  Widget _buildTabBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, 0),
      child: Container(
        height: 44,
        decoration: BoxDecoration(
          color: context.appColors.surfaceAlt,
          borderRadius: BorderRadius.circular(14),
        ),
        child: TabBar(
          controller: _tabController,
          indicator: BoxDecoration(
            color: context.appColors.surface,
            borderRadius: BorderRadius.circular(11),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          dividerColor: Colors.transparent,
          labelColor: AppColors.primary,
          unselectedLabelColor: context.appColors.textTertiary,
          labelStyle: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
          unselectedLabelStyle: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.flash_on_rounded, size: 16),
                  const SizedBox(width: 6),
                  const Text('Activas'),
                  if (_active.isNotEmpty) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${_active.length}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.history_rounded, size: 16),
                  const SizedBox(width: 6),
                  const Text('Historial'),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate(delay: 150.ms).fadeIn();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.appColors.background,
      body: Column(
        children: [
          SafeArea(bottom: false, child: _buildSyncBanner()),
          Expanded(
            child: NestedScrollView(
              headerSliverBuilder: (context, innerBoxIsScrolled) => [
                SliverAppBar(
                  pinned: true,
                  floating: false,
                  elevation: 0,
                  scrolledUnderElevation: 0.5,
                  backgroundColor: context.appColors.background,
                  foregroundColor: context.appColors.textPrimary,
                  titleSpacing: AppSpacing.lg,
                  title: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Buenos días 👋',
                        style:
                            Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: context.appColors.textSecondary,
                                  fontWeight: FontWeight.w500,
                                ),
                      ),
                      Text(
                        'RescateYa',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(
                              color: context.appColors.textPrimary,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.4,
                            ),
                      ),
                    ],
                  ),
                  bottom: PreferredSize(
                    preferredSize: const Size.fromHeight(0),
                    child: Divider(
                      height: 1,
                      color: innerBoxIsScrolled
                          ? context.appColors.border
                          : Colors.transparent,
                    ),
                  ),
                ),
                // Hero SOS y stats como sliver
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      _buildSosHero(),
                      if (!_loading) _buildStatsRow(),
                      _buildTabBar(),
                    ],
                  ),
                ),
              ],
              body: _loading
                  ? const Padding(
                      padding: EdgeInsets.all(AppSpacing.lg),
                      child: IncidentListSkeleton(),
                    )
                  : TabBarView(
                      controller: _tabController,
                      children: [
                        // Tab 1: Activas
                        _IncidentTabList(
                          incidents: _active,
                          emptyIcon: Icons.check_circle_outline_rounded,
                          emptyTitle: 'Sin solicitudes activas',
                          emptySubtitle:
                              'Presiona "Pedir auxilio" para reportar una emergencia.',
                          onEmptyAction: _goToNewEmergency,
                          emptyActionLabel: 'Pedir auxilio',
                          onRefresh: _loadData,
                        ),
                        // Tab 2: Historial
                        _IncidentTabList(
                          incidents: _history,
                          emptyIcon: Icons.history_rounded,
                          emptyTitle: 'Sin historial aún',
                          emptySubtitle:
                              'Aquí aparecerán tus servicios completados.',
                          onRefresh: _loadData,
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Widget: lista de incidentes con pull-to-refresh ──
class _IncidentTabList extends StatelessWidget {
  final List<Incident> incidents;
  final IconData emptyIcon;
  final String emptyTitle;
  final String emptySubtitle;
  final String? emptyActionLabel;
  final VoidCallback? onEmptyAction;
  final Future<void> Function() onRefresh;

  const _IncidentTabList({
    required this.incidents,
    required this.emptyIcon,
    required this.emptyTitle,
    required this.emptySubtitle,
    required this.onRefresh,
    this.emptyActionLabel,
    this.onEmptyAction,
  });

  @override
  Widget build(BuildContext context) {
    if (incidents.isEmpty) {
      return RefreshIndicator(
        onRefresh: onRefresh,
        color: AppColors.primary,
        child: ListView(
          children: [
            SizedBox(
              height: 320,
              child: EmptyState(
                icon: emptyIcon,
                title: emptyTitle,
                subtitle: emptySubtitle,
                actionLabel: emptyActionLabel,
                onAction: onEmptyAction,
              ),
            ),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: onRefresh,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, 100),
        itemCount: incidents.length,
        itemBuilder: (context, index) {
          final inc = incidents[index];
          return _IncidentCard(
            incident: inc,
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => IncidentDetailScreen(incidentId: inc.id),
                ),
              );
              onRefresh();
            },
          )
              .animate(delay: (50 * index).ms)
              .fadeIn(duration: 350.ms)
              .moveY(begin: 12, end: 0);
        },
      ),
    );
  }
}

// ── Widget: stat badge ──
class _StatBadge extends StatelessWidget {
  final String label;
  final int count;
  final Color color;
  final IconData icon;

  const _StatBadge({
    required this.label,
    required this.count,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm, vertical: 10),
        decoration: BoxDecoration(
          color: context.appColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: context.appColors.border),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 15, color: color),
            const SizedBox(width: 5),
            Text(
              '$count',
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w800,
                fontSize: 15,
              ),
            ),
            const SizedBox(width: 4),
            Flexible(
              child: Text(
                label,
                style: TextStyle(
                  color: context.appColors.textTertiary,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Widget: tarjeta de incidente ──
class _IncidentCard extends StatelessWidget {
  final Incident incident;
  final VoidCallback onTap;

  const _IncidentCard({required this.incident, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isActive =
        ['pending', 'assigned', 'in_progress'].contains(incident.status);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        decoration: BoxDecoration(
          color: context.appColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isActive
                ? AppColors.primary.withValues(alpha: 0.25)
                : context.appColors.border,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Estado + prioridad + categoría
              Row(
                children: [
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      StatusChip.priority(incident.priority),
                      StatusChip.category(incident.category),
                      StatusChip.status(incident.status),
                    ],
                  ),
                  const Spacer(),
                  // Indicador activo
                  if (isActive)
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                incident.aiSummary ??
                    incident.description ??
                    'Sin descripción',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: context.appColors.textPrimary,
                      height: 1.5,
                      fontWeight: FontWeight.w500,
                    ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: AppSpacing.sm),
              Divider(height: 1, color: context.appColors.border),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  Icon(
                    Icons.location_on_rounded,
                    size: 13,
                    color: context.appColors.textTertiary,
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      incident.address ??
                          'Lat: ${incident.latitude.toStringAsFixed(4)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: context.appColors.textTertiary,
                            fontSize: 11,
                          ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (incident.estimatedArrival != null) ...[
                    const SizedBox(width: AppSpacing.sm),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.info.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.timer_rounded,
                              size: 11, color: AppColors.info),
                          const SizedBox(width: 3),
                          Text(
                            '${incident.estimatedArrival} min',
                            style: const TextStyle(
                              fontSize: 10,
                              color: AppColors.info,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
