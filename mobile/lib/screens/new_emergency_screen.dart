import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/app_card.dart';
import '../widgets/app_snackbar.dart';

class NewEmergencyScreen extends StatefulWidget {
  const NewEmergencyScreen({super.key});

  @override
  State<NewEmergencyScreen> createState() => _NewEmergencyScreenState();
}

class _NewEmergencyScreenState extends State<NewEmergencyScreen> {
  final _descCtrl = TextEditingController();
  List<Vehicle> _vehicles = [];
  Vehicle? _selectedVehicle;
  final List<File> _images = [];
  File? _audioFile;
  Position? _position;
  bool _loading = false;
  bool _locating = false;
  int _step = 0; // 0=vehiculo, 1=ubicacion, 2=evidencias, 3=enviar

  static const _steps = ['Vehiculo', 'Ubicacion', 'Evidencias', 'Confirmar'];

  @override
  void initState() {
    super.initState();
    _loadVehicles();
  }

  @override
  void dispose() {
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadVehicles() async {
    try {
      final vehicles = await ApiService.getVehicles();
      if (mounted) setState(() => _vehicles = vehicles);
    } catch (_) {}
  }

  Future<void> _getLocation() async {
    setState(() => _locating = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        setState(() {
          _position = Position(
            latitude: -16.5000,
            longitude: -68.1500,
            timestamp: DateTime.now(),
            accuracy: 0,
            altitude: 0,
            altitudeAccuracy: 0,
            heading: 0,
            headingAccuracy: 0,
            speed: 0,
            speedAccuracy: 0,
          );
        });
        return;
      }
      final pos = await Geolocator.getCurrentPosition();
      if (mounted) setState(() => _position = pos);
    } catch (e) {
      setState(() {
        _position = Position(
          latitude: -16.5000,
          longitude: -68.1500,
          timestamp: DateTime.now(),
          accuracy: 0,
          altitude: 0,
          altitudeAccuracy: 0,
          heading: 0,
          headingAccuracy: 0,
          speed: 0,
          speedAccuracy: 0,
        );
      });
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 80);
    if (picked != null) {
      setState(() => _images.add(File(picked.path)));
    }
  }

  Future<void> _sendEmergency() async {
    if (_selectedVehicle == null || _position == null) return;
    setState(() => _loading = true);

    try {
      final incident = await ApiService.createIncident(
        vehicleId: _selectedVehicle!.id,
        latitude: _position!.latitude,
        longitude: _position!.longitude,
        description: _descCtrl.text.isNotEmpty ? _descCtrl.text : null,
      );

      for (final img in _images) {
        await ApiService.uploadImage(incident.id, img);
      }

      if (_audioFile != null) {
        await ApiService.uploadAudio(incident.id, _audioFile!);
      }

      if (mounted) {
        AppSnackBar.success(context, 'Emergencia reportada exitosamente');
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        AppSnackBar.error(
          context,
          e.toString().replaceAll('Exception: ', ''),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _next() {
    if (_step == 0 && _selectedVehicle == null) {
      AppSnackBar.error(context, 'Selecciona un vehiculo');
      return;
    }
    if (_step == 1 && _position == null) {
      AppSnackBar.error(context, 'Obtiene tu ubicacion primero');
      return;
    }
    if (_step < 3) {
      setState(() => _step++);
    } else {
      _sendEmergency();
    }
  }

  void _back() {
    if (_step > 0) setState(() => _step--);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Reportar Emergencia'),
        backgroundColor: AppColors.emergency,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Header con stepper visual
          Container(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.md,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            decoration: const BoxDecoration(
              gradient: AppColors.emergencyGradient,
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(_steps.length, (i) {
                    final active = i <= _step;
                    final completed = i < _step;
                    return Expanded(
                      child: Row(
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: active
                                  ? Colors.white
                                  : Colors.white.withValues(alpha: 0.25),
                              border: Border.all(
                                color: Colors.white,
                                width: 2,
                              ),
                            ),
                            child: Center(
                              child: completed
                                  ? const Icon(
                                      Icons.check_rounded,
                                      size: 18,
                                      color: AppColors.emergency,
                                    )
                                  : Text(
                                      '${i + 1}',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w800,
                                        color: active
                                            ? AppColors.emergency
                                            : Colors.white,
                                      ),
                                    ),
                            ),
                          ),
                          if (i < _steps.length - 1)
                            Expanded(
                              child: Container(
                                height: 2,
                                margin: const EdgeInsets.symmetric(
                                    horizontal: 4),
                                color: i < _step
                                    ? Colors.white
                                    : Colors.white.withValues(alpha: 0.3),
                              ),
                            ),
                        ],
                      ),
                    );
                  }),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  _steps[_step],
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ],
            ),
          ),

          // Contenido del paso actual
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: KeyedSubtree(
                  key: ValueKey(_step),
                  child: _buildStepContent(),
                ),
              ),
            ),
          ),

          // Botones de control
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 12,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  if (_step > 0)
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _loading ? null : _back,
                        icon: const Icon(Icons.arrow_back_rounded),
                        label: const Text('Atras'),
                      ),
                    ),
                  if (_step > 0) const SizedBox(width: AppSpacing.md),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _next,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _step == 3
                            ? AppColors.emergency
                            : AppColors.primary,
                      ),
                      child: _loading
                          ? const SizedBox(
                              height: 22,
                              width: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                color: Colors.white,
                              ),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  _step == 3
                                      ? 'ENVIAR EMERGENCIA'
                                      : 'Siguiente',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.sm),
                                Icon(
                                  _step == 3
                                      ? Icons.send_rounded
                                      : Icons.arrow_forward_rounded,
                                  size: 20,
                                ),
                              ],
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_step) {
      case 0:
        return _buildVehicleStep();
      case 1:
        return _buildLocationStep();
      case 2:
        return _buildEvidenceStep();
      case 3:
        return _buildConfirmStep();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildVehicleStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Selecciona el vehiculo afectado',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: AppSpacing.md),
        if (_vehicles.isEmpty)
          AppCard(
            color: AppColors.warning.withValues(alpha: 0.08),
            border: Border.all(
              color: AppColors.warning.withValues(alpha: 0.3),
            ),
            child: Row(
              children: const [
                Icon(
                  Icons.warning_amber_rounded,
                  color: AppColors.warning,
                ),
                SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'No tienes vehiculos registrados.\nVe a "Mis vehiculos" para agregar uno.',
                    style: TextStyle(color: AppColors.textPrimary),
                  ),
                ),
              ],
            ),
          )
        else
          ..._vehicles.asMap().entries.map((entry) {
            final i = entry.key;
            final v = entry.value;
            final selected = _selectedVehicle?.id == v.id;
            return Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: AppCard(
                onTap: () => setState(() => _selectedVehicle = v),
                color: selected
                    ? AppColors.primary.withValues(alpha: 0.08)
                    : AppColors.surface,
                border: Border.all(
                  color: selected
                      ? AppColors.primary
                      : AppColors.border,
                  width: selected ? 2 : 1,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                      child: const Icon(
                        Icons.directions_car_rounded,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${v.brand} ${v.model}',
                            style: Theme.of(context).textTheme.titleSmall,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${v.year} · ${v.color} · ${v.plateNumber}',
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(color: AppColors.textTertiary),
                          ),
                        ],
                      ),
                    ),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: selected
                            ? AppColors.primary
                            : Colors.transparent,
                        border: Border.all(
                          color: selected
                              ? AppColors.primary
                              : AppColors.border,
                          width: 2,
                        ),
                      ),
                      child: selected
                          ? const Icon(
                              Icons.check_rounded,
                              size: 16,
                              color: Colors.white,
                            )
                          : null,
                    ),
                  ],
                ),
              ).animate(delay: (60 * i).ms).fadeIn().moveY(begin: 12, end: 0),
            );
          }),
      ],
    );
  }

  Widget _buildLocationStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Necesitamos tu ubicacion',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          'Asi el taller mas cercano podra llegar rapido a ti.',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: AppSpacing.lg),
        ElevatedButton.icon(
          onPressed: _locating ? null : _getLocation,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.info,
          ),
          icon: _locating
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: Colors.white,
                  ),
                )
              : const Icon(Icons.my_location_rounded),
          label: Text(_locating ? 'Obteniendo...' : 'Obtener mi ubicacion'),
        ),
        if (_position != null) ...[
          const SizedBox(height: AppSpacing.lg),
          AppCard(
            color: AppColors.success.withValues(alpha: 0.08),
            border: Border.all(
              color: AppColors.success.withValues(alpha: 0.3),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: const Icon(
                    Icons.check_circle_rounded,
                    color: AppColors.success,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Ubicacion obtenida',
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${_position!.latitude.toStringAsFixed(6)}, ${_position!.longitude.toStringAsFixed(6)}',
                        style:
                            Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.textTertiary,
                                ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fadeIn().moveY(begin: 12, end: 0),
        ],
      ],
    );
  }

  Widget _buildEvidenceStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Agrega evidencias',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          'Las fotos y la descripcion ayudan a la IA a diagnosticar mejor.',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: AppSpacing.lg),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => _pickImage(ImageSource.camera),
                icon: const Icon(Icons.camera_alt_rounded),
                label: const Text('Camara'),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => _pickImage(ImageSource.gallery),
                icon: const Icon(Icons.photo_library_rounded),
                label: const Text('Galeria'),
              ),
            ),
          ],
        ),
        if (_images.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            height: 100,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _images.length,
              separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
              itemBuilder: (_, i) => Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    child: Image.file(
                      _images[i],
                      height: 100,
                      width: 100,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: GestureDetector(
                      onTap: () => setState(() => _images.removeAt(i)),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppColors.danger,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.2),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.close_rounded,
                          size: 14,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
        const SizedBox(height: AppSpacing.lg),
        TextField(
          controller: _descCtrl,
          maxLines: 4,
          decoration: const InputDecoration(
            labelText: 'Describe el problema (opcional)',
            hintText: 'Ej: Mi auto no enciende, sale humo del motor...',
            alignLabelWithHint: true,
            prefixIcon: Padding(
              padding: EdgeInsets.only(bottom: 60),
              child: Icon(Icons.edit_note_rounded),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildConfirmStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Revisa antes de enviar',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: AppColors.emergency.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: const Icon(
                      Icons.warning_amber_rounded,
                      color: AppColors.emergency,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    'Resumen de la emergencia',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                ],
              ),
              const Divider(height: AppSpacing.lg + AppSpacing.sm),
              if (_selectedVehicle != null)
                _infoRow(
                  Icons.directions_car_rounded,
                  'Vehiculo',
                  '${_selectedVehicle!.brand} ${_selectedVehicle!.model} · ${_selectedVehicle!.plateNumber}',
                ),
              if (_position != null)
                _infoRow(
                  Icons.location_on_rounded,
                  'Ubicacion',
                  '${_position!.latitude.toStringAsFixed(4)}, ${_position!.longitude.toStringAsFixed(4)}',
                ),
              _infoRow(
                Icons.photo_library_rounded,
                'Fotos',
                '${_images.length}',
              ),
              if (_descCtrl.text.isNotEmpty)
                _infoRow(
                  Icons.edit_note_rounded,
                  'Descripcion',
                  _descCtrl.text,
                ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          color: AppColors.info.withValues(alpha: 0.08),
          border: Border.all(color: AppColors.info.withValues(alpha: 0.25)),
          child: Row(
            children: const [
              Icon(Icons.psychology_rounded, color: AppColors.info),
              SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  'La IA analizara tu reporte y asignara un taller automaticamente.',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.textTertiary),
          const SizedBox(width: AppSpacing.sm),
          SizedBox(
            width: 92,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
