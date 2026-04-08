import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/app_snackbar.dart';
import '../widgets/empty_state.dart';
import '../widgets/loading_skeleton.dart';

class VehiclesScreen extends StatefulWidget {
  const VehiclesScreen({super.key});

  @override
  State<VehiclesScreen> createState() => _VehiclesScreenState();
}

class _VehiclesScreenState extends State<VehiclesScreen> {
  List<Vehicle> _vehicles = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _vehicles = await ApiService.getVehicles();
    } catch (_) {
      if (mounted) {
        AppSnackBar.error(context, 'Error al cargar vehiculos');
      }
    }
    if (mounted) setState(() => _loading = false);
  }

  void _showVehicleForm({Vehicle? vehicle}) {
    final isEdit = vehicle != null;
    final formKey = GlobalKey<FormState>();
    final brandCtrl = TextEditingController(text: vehicle?.brand ?? '');
    final modelCtrl = TextEditingController(text: vehicle?.model ?? '');
    final yearCtrl = TextEditingController(
      text: vehicle != null ? '${vehicle.year}' : '',
    );
    final plateCtrl = TextEditingController(text: vehicle?.plateNumber ?? '');
    String? selectedColor = vehicle?.color;
    bool saving = false;

    const colorOptions = <String, Color>{
      'Blanco': Color(0xFFF5F5F5),
      'Negro': Color(0xFF212121),
      'Gris': Color(0xFF9E9E9E),
      'Plata': Color(0xFFBDBDBD),
      'Rojo': Color(0xFFE53935),
      'Azul': Color(0xFF1E88E5),
      'Verde': Color(0xFF43A047),
      'Amarillo': Color(0xFFFDD835),
      'Naranja': Color(0xFFFB8C00),
      'Cafe': Color(0xFF6D4C41),
      'Beige': Color(0xFFD7CCC8),
      'Vino': Color(0xFF880E4F),
    };

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) {
          return Container(
            margin: EdgeInsets.only(top: MediaQuery.of(ctx).padding.top + 40),
            decoration: BoxDecoration(
              color: context.appColors.surface,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(28),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Handle bar
                Container(
                  margin: const EdgeInsets.only(top: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: context.appColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                // Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    AppSpacing.lg,
                    AppSpacing.lg,
                    0,
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(AppRadius.md),
                        ),
                        child: const Icon(
                          Icons.directions_car_rounded,
                          color: AppColors.primary,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isEdit ? 'Editar vehículo' : 'Nuevo vehículo',
                              style: Theme.of(ctx).textTheme.titleMedium
                                  ?.copyWith(
                                    fontWeight: FontWeight.w800,
                                    color: context.appColors.textPrimary,
                                  ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              isEdit
                                  ? 'Modifica los datos del vehículo'
                                  : 'Completa los datos del vehículo',
                              style: Theme.of(ctx).textTheme.bodySmall
                                  ?.copyWith(
                                    color: context.appColors.textTertiary,
                                  ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: Icon(
                          Icons.close_rounded,
                          color: context.appColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Divider(height: 1, color: context.appColors.border),
                // Form
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Form(
                      key: formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Marca & Modelo en fila
                          Row(
                            children: [
                              Expanded(
                                child: TextFormField(
                                  controller: brandCtrl,
                                  textCapitalization: TextCapitalization.words,
                                  decoration: InputDecoration(
                                    labelText: 'Marca',
                                    hintText: 'Toyota',
                                    prefixIcon: Icon(
                                      Icons.business_rounded,
                                      color: context.appColors.textTertiary,
                                      size: 20,
                                    ),
                                  ),
                                  validator: (v) =>
                                      (v == null || v.trim().isEmpty)
                                      ? 'Requerido'
                                      : null,
                                ),
                              ),
                              const SizedBox(width: AppSpacing.md),
                              Expanded(
                                child: TextFormField(
                                  controller: modelCtrl,
                                  textCapitalization: TextCapitalization.words,
                                  decoration: InputDecoration(
                                    labelText: 'Modelo',
                                    hintText: 'Corolla',
                                    prefixIcon: Icon(
                                      Icons.directions_car_rounded,
                                      color: context.appColors.textTertiary,
                                      size: 20,
                                    ),
                                  ),
                                  validator: (v) =>
                                      (v == null || v.trim().isEmpty)
                                      ? 'Requerido'
                                      : null,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          // Año & Placa en fila
                          Row(
                            children: [
                              Expanded(
                                child: TextFormField(
                                  controller: yearCtrl,
                                  keyboardType: TextInputType.number,
                                  decoration: InputDecoration(
                                    labelText: 'Año',
                                    hintText: '2024',
                                    prefixIcon: Icon(
                                      Icons.calendar_today_rounded,
                                      color: context.appColors.textTertiary,
                                      size: 20,
                                    ),
                                  ),
                                  validator: (v) {
                                    if (v == null || v.isEmpty) {
                                      return 'Requerido';
                                    }
                                    final year = int.tryParse(v);
                                    if (year == null ||
                                        year < 1900 ||
                                        year > 2100) {
                                      return 'Año inválido';
                                    }
                                    return null;
                                  },
                                ),
                              ),
                              const SizedBox(width: AppSpacing.md),
                              Expanded(
                                child: TextFormField(
                                  controller: plateCtrl,
                                  textCapitalization:
                                      TextCapitalization.characters,
                                  decoration: InputDecoration(
                                    labelText: 'Placa',
                                    hintText: 'ABC123',
                                    prefixIcon: Icon(
                                      Icons.confirmation_number_rounded,
                                      color: context.appColors.textTertiary,
                                      size: 20,
                                    ),
                                  ),
                                  validator: (v) =>
                                      (v == null || v.trim().isEmpty)
                                      ? 'Requerido'
                                      : null,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          // Color selector
                          Text(
                            'Color del vehículo',
                            style: Theme.of(ctx).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: context.appColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: colorOptions.entries.map((e) {
                              final isSelected = selectedColor == e.key;
                              final isDark = e.value.computeLuminance() < 0.4;
                              return GestureDetector(
                                onTap: () {
                                  setLocal(() => selectedColor = e.key);
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  width: 56,
                                  height: 56,
                                  decoration: BoxDecoration(
                                    color: e.value,
                                    borderRadius: BorderRadius.circular(
                                      AppRadius.md,
                                    ),
                                    border: Border.all(
                                      color: isSelected
                                          ? AppColors.primary
                                          : context.appColors.border,
                                      width: isSelected ? 2.5 : 1,
                                    ),
                                    boxShadow: isSelected
                                        ? [
                                            BoxShadow(
                                              color: AppColors.primary
                                                  .withValues(alpha: 0.3),
                                              blurRadius: 8,
                                              spreadRadius: 1,
                                            ),
                                          ]
                                        : null,
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      if (isSelected)
                                        Icon(
                                          Icons.check_rounded,
                                          size: 18,
                                          color: isDark
                                              ? Colors.white
                                              : Colors.black87,
                                        ),
                                      Text(
                                        e.key,
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: isSelected
                                              ? FontWeight.w800
                                              : FontWeight.w600,
                                          color: isDark
                                              ? Colors.white
                                              : Colors.black87,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                          if (selectedColor == null)
                            Padding(
                              padding: const EdgeInsets.only(
                                top: AppSpacing.xs,
                              ),
                              child: Text(
                                '',
                                style: Theme.of(ctx).textTheme.bodySmall
                                    ?.copyWith(
                                      color: context.appColors.textTertiary,
                                    ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
                // Actions
                Container(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    AppSpacing.md,
                    AppSpacing.lg,
                    AppSpacing.lg,
                  ),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(color: context.appColors.border),
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: saving ? null : () => Navigator.pop(ctx),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            side: BorderSide(color: context.appColors.border),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(AppRadius.md),
                            ),
                          ),
                          child: Text(
                            'Cancelar',
                            style: TextStyle(
                              color: context.appColors.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton.icon(
                          onPressed: saving
                              ? null
                              : () async {
                                  if (selectedColor == null) {
                                    AppSnackBar.error(
                                      ctx,
                                      'Selecciona un color',
                                    );
                                    return;
                                  }
                                  if (!formKey.currentState!.validate()) {
                                    return;
                                  }
                                  setLocal(() => saving = true);
                                  try {
                                    final data = {
                                      'brand': brandCtrl.text.trim(),
                                      'model': modelCtrl.text.trim(),
                                      'year': int.parse(yearCtrl.text.trim()),
                                      'color': selectedColor,
                                      'plate_number': plateCtrl.text.trim(),
                                    };
                                    if (isEdit) {
                                      await ApiService.updateVehicle(
                                        vehicle.id,
                                        data,
                                      );
                                    } else {
                                      await ApiService.createVehicle(data);
                                    }
                                    if (ctx.mounted) Navigator.pop(ctx);
                                    if (mounted) {
                                      AppSnackBar.success(
                                        context,
                                        isEdit
                                            ? 'Vehículo actualizado'
                                            : 'Vehículo agregado',
                                      );
                                    }
                                    _load();
                                  } catch (e) {
                                    setLocal(() => saving = false);
                                    if (ctx.mounted) {
                                      AppSnackBar.error(
                                        ctx,
                                        e.toString().replaceAll(
                                          'Exception: ',
                                          '',
                                        ),
                                      );
                                    }
                                  }
                                },
                          icon: saving
                              ? const SizedBox(
                                  height: 16,
                                  width: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Icon(Icons.check_rounded, size: 18),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(AppRadius.md),
                            ),
                          ),
                          label: Text(
                            saving
                                ? 'Guardando...'
                                : isEdit
                                ? 'Actualizar'
                                : 'Guardar vehículo',
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _confirmDelete(Vehicle v) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        title: const Text('Eliminar vehículo'),
        content: Text(
          '¿Estás seguro de eliminar ${v.brand} ${v.model} (${v.plateNumber})?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await ApiService.deleteVehicle(v.id);
                if (mounted) {
                  AppSnackBar.success(context, 'Vehículo eliminado');
                }
                _load();
              } catch (e) {
                if (mounted) {
                  AppSnackBar.error(
                    context,
                    e.toString().replaceAll('Exception: ', ''),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.appColors.background,
      appBar: AppBar(
        title: const Text('Mis Vehículos'),
        backgroundColor: context.appColors.background,
        foregroundColor: context.appColors.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: false,
        titleTextStyle: Theme.of(context).textTheme.headlineSmall?.copyWith(
          color: context.appColors.textPrimary,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.5,
        ),
      ),
      body: _loading
          ? ListView.builder(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: 4,
              itemBuilder: (_, _) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: AppShimmer(
                  child: Container(
                    height: 90,
                    decoration: BoxDecoration(
                      color: context.appColors.surface,
                      borderRadius: BorderRadius.circular(24),
                    ),
                  ),
                ),
              ),
            )
          : _vehicles.isEmpty
          ? EmptyState(
              icon: Icons.directions_car_rounded,
              title: 'Sin vehículos',
              subtitle: 'Agrega tu primer vehículo para reportar emergencias.',
              actionLabel: 'Agregar vehículo',
              onAction: _showVehicleForm,
            )
          : RefreshIndicator(
              onRefresh: _load,
              color: AppColors.primary,
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.lg,
                  100,
                ),
                itemCount: _vehicles.length,
                itemBuilder: (_, i) {
                  final v = _vehicles[i];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.md),
                    child:
                        GestureDetector(
                              onTap: () => _showVehicleForm(vehicle: v),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: context.appColors.surface,
                                  borderRadius: BorderRadius.circular(24),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(
                                        alpha: 0.04,
                                      ),
                                      blurRadius: 20,
                                      spreadRadius: 2,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                padding: const EdgeInsets.all(AppSpacing.md),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 60,
                                      height: 60,
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withValues(
                                          alpha: 0.08,
                                        ),
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      child: const Icon(
                                        Icons.directions_car_rounded,
                                        color: AppColors.primary,
                                        size: 28,
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.lg),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            '${v.brand} ${v.model}',
                                            style: Theme.of(context)
                                                .textTheme
                                                .titleSmall
                                                ?.copyWith(
                                                  color: context
                                                      .appColors
                                                      .textPrimary,
                                                  fontWeight: FontWeight.w700,
                                                ),
                                          ),
                                          const SizedBox(height: 4),
                                          Row(
                                            children: [
                                              Icon(
                                                Icons.calendar_today_rounded,
                                                size: 12,
                                                color: context
                                                    .appColors
                                                    .textTertiary,
                                              ),
                                              const SizedBox(width: 4),
                                              Text(
                                                '${v.year}',
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodySmall
                                                    ?.copyWith(
                                                      color: const Color(
                                                        0xFF8C95A8,
                                                      ),
                                                    ),
                                              ),
                                              const SizedBox(width: 8),
                                              Container(
                                                width: 3,
                                                height: 3,
                                                decoration: BoxDecoration(
                                                  color: context
                                                      .appColors
                                                      .textTertiary,
                                                  shape: BoxShape.circle,
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Flexible(
                                                child: Text(
                                                  v.color,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodySmall
                                                      ?.copyWith(
                                                        color: const Color(
                                                          0xFF8C95A8,
                                                        ),
                                                      ),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 10,
                                              vertical: 4,
                                            ),
                                            decoration: BoxDecoration(
                                              color: AppColors.primary
                                                  .withValues(alpha: 0.12),
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              v.plateNumber,
                                              style: const TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.w800,
                                                color: AppColors.primary,
                                                letterSpacing: 1,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    PopupMenuButton<String>(
                                      icon: Icon(
                                        Icons.more_vert_rounded,
                                        color: context.appColors.textTertiary,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(
                                          AppRadius.md,
                                        ),
                                      ),
                                      onSelected: (action) {
                                        if (action == 'edit') {
                                          _showVehicleForm(vehicle: v);
                                        } else if (action == 'delete') {
                                          _confirmDelete(v);
                                        }
                                      },
                                      itemBuilder: (_) => [
                                        const PopupMenuItem(
                                          value: 'edit',
                                          child: Row(
                                            children: [
                                              Icon(
                                                Icons.edit_rounded,
                                                size: 18,
                                              ),
                                              SizedBox(width: 8),
                                              Text('Editar'),
                                            ],
                                          ),
                                        ),
                                        const PopupMenuItem(
                                          value: 'delete',
                                          child: Row(
                                            children: [
                                              Icon(
                                                Icons.delete_rounded,
                                                size: 18,
                                                color: Colors.red,
                                              ),
                                              SizedBox(width: 8),
                                              Text(
                                                'Eliminar',
                                                style: TextStyle(
                                                  color: Colors.red,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            )
                            .animate(delay: (60 * i).ms)
                            .fadeIn(duration: 400.ms)
                            .moveY(begin: 16, end: 0),
                  );
                },
              ),
            ),
      floatingActionButton: _vehicles.isEmpty
          ? null
          : FloatingActionButton.extended(
              onPressed: _showVehicleForm,
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              icon: const Icon(Icons.add_rounded),
              label: const Text(
                'Agregar',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
              ),
            ),
    );
  }
}
