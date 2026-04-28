import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';

import '../blocs/blocs.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/app_snackbar.dart';
import '../widgets/empty_state.dart';
import '../widgets/status_chip.dart';
import 'chat_screen.dart';

class TechnicianJobsScreen extends StatefulWidget {
  const TechnicianJobsScreen({super.key});

  @override
  State<TechnicianJobsScreen> createState() => _TechnicianJobsScreenState();
}

class _TechnicianJobsScreenState extends State<TechnicianJobsScreen> {
  Technician? _technician;
  List<Incident> _jobs = [];
  bool _loading = true;
  bool _sharingLocation = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        ApiService.getMyTechnicianProfile(),
        ApiService.getTechnicianJobs(),
      ]);
      if (!mounted) return;
      setState(() {
        _technician = results[0] as Technician;
        _jobs = results[1] as List<Incident>;
      });
    } catch (_) {
      if (mounted) {
        AppSnackBar.error(context, 'No se pudieron cargar tus trabajos');
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _shareLocation() async {
    setState(() => _sharingLocation = true);
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        if (mounted) {
          AppSnackBar.error(context, 'Activa el permiso de ubicacion');
        }
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
        ),
      );
      final technician = await ApiService.updateTechnicianLocation(
        latitude: position.latitude,
        longitude: position.longitude,
      );
      if (!mounted) return;
      setState(() => _technician = technician);
      AppSnackBar.success(context, 'Ubicacion enviada al taller y cliente');
    } catch (_) {
      if (mounted) {
        AppSnackBar.error(context, 'No se pudo actualizar tu ubicacion');
      }
    } finally {
      if (mounted) {
        setState(() => _sharingLocation = false);
      }
    }
  }

  Future<void> _setStatus(Incident job, String status) async {
    try {
      final updated = await ApiService.updateTechnicianJobStatus(
        incidentId: job.id,
        status: status,
      );
      if (!mounted) return;
      setState(() {
        _jobs = _jobs
            .map((item) => item.id == updated.id ? updated : item)
            .toList();
      });
      AppSnackBar.success(context, 'Estado actualizado');
    } catch (_) {
      if (mounted) {
        AppSnackBar.error(context, 'No se pudo actualizar el servicio');
      }
    }
  }

  Future<void> _showEvidenceSheet(Incident job) async {
    final messenger = ScaffoldMessenger.of(context);
    final colors = context.appColors;
    final titleStyle = Theme.of(context).textTheme.titleLarge?.copyWith(
      color: colors.textPrimary,
      fontWeight: FontWeight.w800,
    );
    var note = '';
    File? image;
    final evidence = await showModalBottomSheet<({String note, File? image})>(
      context: context,
      isScrollControlled: true,
      backgroundColor: colors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.lg,
            AppSpacing.lg,
            MediaQuery.of(ctx).viewInsets.bottom + AppSpacing.lg,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Reporte de atencion', style: titleStyle),
              const SizedBox(height: AppSpacing.md),
              TextField(
                minLines: 3,
                maxLines: 5,
                onChanged: (value) => note = value,
                decoration: const InputDecoration(
                  labelText: 'Notas del servicio',
                  hintText: 'Describe que revisaste o reparaste',
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              OutlinedButton.icon(
                onPressed: () async {
                  final picked = await ImagePicker().pickImage(
                    source: ImageSource.camera,
                    imageQuality: 80,
                  );
                  if (!ctx.mounted) return;
                  if (picked != null) {
                    setModalState(() => image = File(picked.path));
                  }
                },
                icon: const Icon(Icons.photo_camera_rounded),
                label: Text(
                  image == null ? 'Agregar foto' : 'Foto seleccionada',
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    final cleanNote = note.trim();
                    if (cleanNote.isEmpty && image == null) {
                      AppSnackBar.showOn(
                        messenger,
                        'Agrega una nota o foto',
                        isError: true,
                      );
                      return;
                    }
                    Navigator.of(ctx).pop((note: cleanNote, image: image));
                  },
                  icon: const Icon(Icons.upload_rounded),
                  label: const Text('Enviar reporte'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
    if (evidence == null) return;

    try {
      final updated = await ApiService.uploadTechnicianEvidence(
        incidentId: job.id,
        note: evidence.note,
        image: evidence.image,
      );
      if (!mounted) return;
      setState(() {
        _jobs = _jobs
            .map((item) => item.id == updated.id ? updated : item)
            .toList();
      });
      AppSnackBar.showOn(messenger, 'Reporte enviado');
    } catch (e) {
      AppSnackBar.showOn(
        messenger,
        e.toString().replaceAll('Exception: ', ''),
        isError: true,
      );
    }
  }

  void _logout() {
    context.read<AuthBloc>().add(AuthLogoutRequested());
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: const Text('Mis trabajos'),
        actions: [
          IconButton(
            tooltip: 'Actualizar',
            onPressed: _loading ? null : _loadData,
            icon: const Icon(Icons.refresh_rounded),
          ),
          IconButton(
            tooltip: 'Cerrar sesion',
            onPressed: _logout,
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: AppColors.primary,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.lg,
                  100,
                ),
                children: [
                  _TechnicianHeader(
                    technician: _technician,
                    sharingLocation: _sharingLocation,
                    onShareLocation: _shareLocation,
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    'Servicios asignados',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: colors.textPrimary,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  if (_jobs.isEmpty)
                    SizedBox(
                      height: MediaQuery.of(context).size.height * 0.45,
                      child: const EmptyState(
                        icon: Icons.construction_rounded,
                        title: 'Sin trabajos asignados',
                        subtitle:
                            'Cuando el taller te asigne un servicio aparecera aqui.',
                      ),
                    )
                  else
                    ..._jobs.map(
                      (job) => _JobCard(
                        job: job,
                        onStart: () => _setStatus(job, 'in_progress'),
                        onChat: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ChatScreen(incidentId: job.id),
                          ),
                        ),
                        onEvidence: () => _showEvidenceSheet(job),
                      ),
                    ),
                ],
              ),
      ),
    );
  }
}

class _TechnicianHeader extends StatelessWidget {
  final Technician? technician;
  final bool sharingLocation;
  final VoidCallback onShareLocation;

  const _TechnicianHeader({
    required this.technician,
    required this.sharingLocation,
    required this.onShareLocation,
  });

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: AppColors.primary,
                child: Text(
                  _initials(technician?.name ?? 'Tecnico'),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      technician?.name ?? 'Tecnico AsisteCar',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: colors.textPrimary,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      technician?.specialties ?? 'Auxilio mecanico',
                      style: TextStyle(color: colors.textSecondary),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: sharingLocation ? null : onShareLocation,
              icon: sharingLocation
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.my_location_rounded),
              label: Text(
                sharingLocation
                    ? 'Enviando ubicacion...'
                    : 'Compartir ubicacion',
              ),
            ),
          ),
          if (technician?.lastLocationAt != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Ultima ubicacion enviada: ${technician!.lastLocationAt}',
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: colors.textTertiary),
            ),
          ],
        ],
      ),
    );
  }

  String _initials(String name) {
    final parts = name.split(' ').where((part) => part.isNotEmpty).toList();
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return parts.isEmpty ? '?' : parts.first[0].toUpperCase();
  }
}

class _JobCard extends StatelessWidget {
  final Incident job;
  final VoidCallback onStart;
  final VoidCallback onChat;
  final VoidCallback onEvidence;

  const _JobCard({
    required this.job,
    required this.onStart,
    required this.onChat,
    required this.onEvidence,
  });

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final isInProgress = job.status == 'in_progress';
    final isCompleted = job.status == 'completed';
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                child: Icon(
                  _categoryIcon(job.category),
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  _categoryLabel(job.category),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: colors.textPrimary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              StatusChip.status(job.status),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: isCompleted ? null : onEvidence,
              icon: const Icon(Icons.add_photo_alternate_rounded),
              label: const Text('Subir evidencia final'),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            job.description ?? job.aiSummary ?? 'Servicio sin descripcion',
            style: TextStyle(color: colors.textSecondary, height: 1.4),
          ),
          const SizedBox(height: AppSpacing.md),
          _MetaRow(
            icon: Icons.location_on_rounded,
            text: job.address ?? 'Ubicacion GPS',
          ),
          _MetaRow(
            icon: Icons.near_me_rounded,
            text: '${job.latitude}, ${job.longitude}',
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: isInProgress || isCompleted ? null : onStart,
                  icon: const Icon(Icons.route_rounded),
                  label: const Text('En camino'),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onChat,
                  icon: const Icon(Icons.chat_rounded),
                  label: const Text('Chat'),
                ),
              ),
            ],
          ),
          if (isInProgress && !isCompleted) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Cuando termines la atencion, el cliente cerrara el servicio registrando el pago.',
              style: TextStyle(color: colors.textTertiary, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }

  IconData _categoryIcon(String category) {
    switch (category) {
      case 'battery':
        return Icons.battery_alert_rounded;
      case 'tire':
        return Icons.tire_repair_rounded;
      case 'crash':
        return Icons.car_crash_rounded;
      case 'engine':
        return Icons.settings_rounded;
      case 'keys':
        return Icons.key_rounded;
      default:
        return Icons.build_rounded;
    }
  }

  String _categoryLabel(String category) {
    switch (category) {
      case 'battery':
        return 'Bateria';
      case 'tire':
        return 'Llanta';
      case 'crash':
        return 'Choque';
      case 'engine':
        return 'Motor';
      case 'keys':
        return 'Llaves';
      default:
        return 'Auxilio mecanico';
    }
  }
}

class _MetaRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _MetaRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: colors.textTertiary),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(text, style: TextStyle(color: colors.textSecondary)),
          ),
        ],
      ),
    );
  }
}
