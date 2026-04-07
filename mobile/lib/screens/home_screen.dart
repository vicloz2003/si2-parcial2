import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/app_card.dart';
import '../widgets/app_snackbar.dart';
import '../widgets/empty_state.dart';
import '../widgets/loading_skeleton.dart';
import '../widgets/status_chip.dart';
import 'login_screen.dart';
import 'new_emergency_screen.dart';
import 'incident_detail_screen.dart';
import 'vehicles_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Incident> _incidents = [];
  List<AppNotification> _notifications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final incidents = await ApiService.getIncidents();
      final notifications = await ApiService.getNotifications();
      if (!mounted) return;
      setState(() {
        _incidents = incidents;
        _notifications = notifications;
      });
    } catch (e) {
      if (mounted) {
        AppSnackBar.error(context, 'Error al cargar datos');
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  int get _unreadCount => _notifications.where((n) => !n.isRead).length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            expandedHeight: 140,
            pinned: true,
            elevation: 0,
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              title: Text(
                'EmergenciApp',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: AppColors.primaryGradient,
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      AppSpacing.md,
                      AppSpacing.lg,
                      AppSpacing.xl,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Hola 👋',
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(
                                color: Colors.white.withValues(alpha: 0.85),
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            actions: [
              IconButton(
                tooltip: 'Notificaciones',
                onPressed: _showNotifications,
                icon: Badge(
                  isLabelVisible: _unreadCount > 0,
                  label: Text('$_unreadCount'),
                  backgroundColor: AppColors.accent,
                  child: const Icon(Icons.notifications_rounded),
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert_rounded),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                itemBuilder: (_) => const [
                  PopupMenuItem(
                    value: 'vehicles',
                    child: Row(
                      children: [
                        Icon(Icons.directions_car_rounded,
                            color: AppColors.primary),
                        SizedBox(width: AppSpacing.sm),
                        Text('Mis vehiculos'),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'logout',
                    child: Row(
                      children: [
                        Icon(Icons.logout_rounded, color: AppColors.danger),
                        SizedBox(width: AppSpacing.sm),
                        Text('Cerrar sesion'),
                      ],
                    ),
                  ),
                ],
                onSelected: (value) async {
                  if (value == 'logout') {
                    await ApiService.logout();
                    if (mounted) {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const LoginScreen()),
                      );
                    }
                  } else if (value == 'vehicles') {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const VehiclesScreen()),
                    );
                  }
                },
              ),
              const SizedBox(width: AppSpacing.xs),
            ],
          ),
        ],
        body: RefreshIndicator(
          onRefresh: _loadData,
          color: AppColors.primary,
          child: _loading
              ? const IncidentListSkeleton()
              : _incidents.isEmpty
                  ? ListView(
                      // ListView para que el RefreshIndicator funcione
                      children: [
                        SizedBox(
                          height: MediaQuery.of(context).size.height * 0.55,
                          child: EmptyState(
                            icon: Icons.check_circle_outline_rounded,
                            title: 'Todo en orden',
                            subtitle:
                                'No tienes solicitudes activas.\nPresiona EMERGENCIA si necesitas ayuda.',
                            actionLabel: 'Reportar emergencia',
                            onAction: _goToNewEmergency,
                          ),
                        ),
                      ],
                    )
                  : _buildIncidentList(),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _goToNewEmergency,
        backgroundColor: AppColors.emergency,
        foregroundColor: Colors.white,
        elevation: 6,
        icon: const Icon(Icons.warning_amber_rounded),
        label: const Text(
          'EMERGENCIA',
          style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 0.8),
        ),
      ).animate().scale(
            duration: 400.ms,
            curve: Curves.easeOutBack,
            begin: const Offset(0.6, 0.6),
          ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Future<void> _goToNewEmergency() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const NewEmergencyScreen()),
    );
    if (result == true) _loadData();
  }

  Widget _buildIncidentList() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.md,
        AppSpacing.md,
        100,
      ),
      itemCount: _incidents.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Padding(
            padding: const EdgeInsets.only(
              left: AppSpacing.xs,
              bottom: AppSpacing.md,
            ),
            child: Row(
              children: [
                Text(
                  'Solicitudes activas',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(width: AppSpacing.sm),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                  ),
                  child: Text(
                    '${_incidents.length}',
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                ),
              ],
            ),
          );
        }
        final inc = _incidents[index - 1];
        return _IncidentCard(
          incident: inc,
          onTap: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => IncidentDetailScreen(incidentId: inc.id),
              ),
            );
            _loadData();
          },
        )
            .animate(delay: (60 * (index - 1)).ms)
            .fadeIn(duration: 400.ms)
            .moveY(begin: 16, end: 0);
      },
    );
  }

  void _showNotifications() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.3,
        maxChildSize: 0.9,
        expand: false,
        builder: (_, scrollCtrl) => Column(
          children: [
            // Drag handle
            Container(
              margin: const EdgeInsets.only(top: AppSpacing.sm),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(AppRadius.pill),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.sm,
                AppSpacing.sm,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.notifications_rounded,
                          color: AppColors.primary),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        'Notificaciones',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: _notifications.isEmpty
                  ? const EmptyState(
                      icon: Icons.notifications_off_rounded,
                      title: 'Sin notificaciones',
                      subtitle: 'Te avisaremos cuando haya novedades.',
                    )
                  : ListView.separated(
                      controller: scrollCtrl,
                      padding: const EdgeInsets.symmetric(
                        vertical: AppSpacing.sm,
                      ),
                      itemCount: _notifications.length,
                      separatorBuilder: (_, __) =>
                          const Divider(height: 1, indent: 72),
                      itemBuilder: (_, i) {
                        final n = _notifications[i];
                        final color = _getNotificationColor(n.type);
                        return ListTile(
                          leading: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.12),
                              borderRadius:
                                  BorderRadius.circular(AppRadius.md),
                            ),
                            child: Icon(
                              _getNotificationIcon(n.type),
                              color: color,
                            ),
                          ),
                          title: Text(
                            n.title,
                            style: TextStyle(
                              fontWeight: n.isRead
                                  ? FontWeight.w500
                                  : FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          subtitle: Text(
                            n.message,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          trailing: !n.isRead
                              ? Container(
                                  width: 10,
                                  height: 10,
                                  decoration: const BoxDecoration(
                                    color: AppColors.accent,
                                    shape: BoxShape.circle,
                                  ),
                                )
                              : null,
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'new_incident':
        return Icons.warning_amber_rounded;
      case 'incident_assigned':
        return Icons.handshake_rounded;
      case 'status_update':
        return Icons.update_rounded;
      case 'technician_en_route':
        return Icons.directions_car_rounded;
      case 'service_completed':
        return Icons.check_circle_rounded;
      case 'payment':
        return Icons.payment_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color _getNotificationColor(String type) {
    switch (type) {
      case 'new_incident':
        return AppColors.emergency;
      case 'incident_assigned':
        return AppColors.statusAssigned;
      case 'status_update':
        return AppColors.info;
      case 'technician_en_route':
        return AppColors.statusInProgress;
      case 'service_completed':
        return AppColors.success;
      case 'payment':
        return AppColors.accent;
      default:
        return AppColors.primary;
    }
  }
}

class _IncidentCard extends StatelessWidget {
  final Incident incident;
  final VoidCallback onTap;

  const _IncidentCard({required this.incident, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      onTap: onTap,
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              StatusChip.priority(incident.priority),
              const SizedBox(width: AppSpacing.xs),
              Flexible(child: StatusChip.category(incident.category)),
              const SizedBox(width: AppSpacing.xs),
              const Spacer(),
              StatusChip.status(incident.status),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            incident.aiSummary ??
                incident.description ??
                'Sin descripcion',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textPrimary,
                  height: 1.4,
                ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: AppSpacing.sm),
          const Divider(height: 1),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              const Icon(
                Icons.location_on_rounded,
                size: 14,
                color: AppColors.textTertiary,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  incident.address ??
                      'Lat: ${incident.latitude.toStringAsFixed(4)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textTertiary,
                      ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (incident.estimatedArrival != null) ...[
                const SizedBox(width: AppSpacing.sm),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.info.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.timer_rounded,
                        size: 12,
                        color: AppColors.info,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${incident.estimatedArrival} min',
                        style: const TextStyle(
                          fontSize: 11,
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
    );
  }
}
