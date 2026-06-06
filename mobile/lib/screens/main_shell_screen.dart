import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_snackbar.dart';
import 'home_screen.dart';
import 'history_screen.dart';
import 'new_emergency_screen.dart';
import 'notifications_screen.dart';
import 'profile_screen.dart';

class MainShellScreen extends StatefulWidget {
  const MainShellScreen({super.key});

  @override
  State<MainShellScreen> createState() => _MainShellScreenState();
}

class _MainShellScreenState extends State<MainShellScreen> {
  int _currentIndex = 0;
  StreamSubscription? _wsSub;
  int _unreadCount = 0;

  static const List<String> _screenKeys = [
    'home',
    'history',
    'new_emergency',
    'notifications',
    'profile',
  ];

  static const List<String> _screenLabels = [
    'Inicio',
    'Historial',
    'SOS',
    'Alertas',
    'Perfil',
  ];

  final List<Widget> _screens = const [
    HomeScreen(),
    HistoryScreen(),
    SizedBox(), // placeholder - emergencia abre pantalla completa
    NotificationsScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _connectWebSocket();
    _loadUnread();
  }

  @override
  void dispose() {
    _wsSub?.cancel();
    super.dispose();
  }

  void _connectWebSocket() {
    final ws = WebSocketService.instance;
    ws.connect();
    _wsSub = ws.notifications.listen((message) {
      _loadUnread();
      if (mounted && message['title'] != null) {
        AppSnackBar.info(context, message['title'] as String);
      }
    });
  }

  Future<void> _loadUnread() async {
    try {
      final notifs = await ApiService.getNotifications();
      if (mounted) {
        setState(() {
          _unreadCount = notifs.where((n) => !n.isRead).length;
        });
      }
    } catch (_) {}
  }

  void _onTabTapped(int index) {
    if (index == 2) {
      // Tab central: abrir pantalla de emergencia
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const NewEmergencyScreen()),
      ).then((_) => _loadUnread());
      return;
    }
    setState(() => _currentIndex = index);
  }

  Future<void> _openAssistant() async {
    final controller = TextEditingController();
    var loading = true;
    var message = 'Analizando esta pantalla...';
    var actions = <String>[];
    var initialRequestStarted = false;
    var sheetOpen = true;

    Future<void> ask(
      String? question,
      void Function(void Function()) update,
    ) async {
      if (!sheetOpen) return;
      update(() {
        loading = true;
        if (question != null && question.trim().isNotEmpty) {
          message = 'Pensando la mejor guia para esta pantalla...';
        }
      });
      try {
        final response = await ApiService.askAssistant(
          screen: _screenKeys[_currentIndex],
          question: question,
          visibleState: {
            'tab_index': _currentIndex,
            'screen_label': _screenLabels[_currentIndex],
            'unread_notifications': _unreadCount,
          },
        );
        if (!sheetOpen) return;
        update(() {
          message = response.message;
          actions = response.suggestedActions;
          loading = false;
          controller.clear();
        });
      } catch (_) {
        if (!sheetOpen) return;
        update(() {
          message =
              'No pude conectar con el asistente. Verifica que el backend este corriendo e intenta de nuevo.';
          actions = [];
          loading = false;
        });
      }
    }

    void handleAction(
      BuildContext sheetContext,
      String action,
      void Function(void Function()) update,
    ) {
      switch (action) {
        case 'crear_emergencia':
        case 'confirmar_ubicacion':
        case 'agregar_foto':
        case 'enviar_reporte':
          Navigator.pop(sheetContext);
          Future.microtask(() {
            if (mounted) _onTabTapped(2);
          });
          return;
        case 'agregar_vehiculo':
        case 'editar_vehiculo':
          Navigator.pop(sheetContext);
          Future.microtask(() {
            if (mounted) setState(() => _currentIndex = 1);
          });
          return;
        case 'abrir_notificacion':
        case 'marcar_como_leida':
          Navigator.pop(sheetContext);
          Future.microtask(() {
            if (mounted) setState(() => _currentIndex = 3);
          });
          return;
        case 'actualizar_perfil':
          Navigator.pop(sheetContext);
          Future.microtask(() {
            if (mounted) setState(() => _currentIndex = 4);
          });
          return;
        case 'revisar_estado':
          Navigator.pop(sheetContext);
          Future.microtask(() {
            if (mounted) setState(() => _currentIndex = 0);
          });
          return;
        default:
          ask(action, update);
      }
    }

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            if (!initialRequestStarted) {
              initialRequestStarted = true;
              Future.microtask(
                () => ask('explicar esta pantalla', setModalState),
              );
            }
            final bottomInset = MediaQuery.of(context).viewInsets.bottom;
            return Padding(
              padding: EdgeInsets.only(bottom: bottomInset),
              child: Container(
                decoration: BoxDecoration(
                  color: context.appColors.surface,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(24),
                  ),
                  border: Border(
                    top: BorderSide(color: context.appColors.border),
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                child: SafeArea(
                  top: false,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.support_agent_rounded,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Asistente IA',
                                  style: TextStyle(
                                    color: AppColors.primary,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                Text(
                                  'Guia para ${_screenLabels[_currentIndex]}',
                                  style: TextStyle(
                                    color: context.appColors.textPrimary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: () => Navigator.pop(sheetContext),
                            icon: const Icon(Icons.close_rounded),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: context.appColors.surfaceAlt,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: context.appColors.border),
                        ),
                        child: loading
                            ? Row(
                                children: [
                                  const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      message,
                                      style: TextStyle(
                                        color: context.appColors.textSecondary,
                                      ),
                                    ),
                                  ),
                                ],
                              )
                            : Text(
                                message,
                                style: TextStyle(
                                  color: context.appColors.textPrimary,
                                  height: 1.45,
                                ),
                              ),
                      ),
                      if (actions.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: actions.map((action) {
                            return ActionChip(
                              label: Text(action.replaceAll('_', ' ')),
                              onPressed: loading
                                  ? null
                                  : () => handleAction(
                                      sheetContext,
                                      action,
                                      setModalState,
                                    ),
                            );
                          }).toList(),
                        ),
                      ],
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: controller,
                              enabled: !loading,
                              decoration: const InputDecoration(
                                hintText: 'Pregunta sobre esta pantalla',
                                border: OutlineInputBorder(),
                              ),
                              minLines: 1,
                              maxLines: 3,
                            ),
                          ),
                          const SizedBox(width: 8),
                          FilledButton(
                            onPressed: loading
                                ? null
                                : () => ask(controller.text, setModalState),
                            child: const Icon(Icons.send_rounded),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
    sheetOpen = false;
    controller.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      floatingActionButton: FloatingActionButton.small(
        heroTag: 'contextualAssistant',
        onPressed: _openAssistant,
        tooltip: 'Asistente IA',
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        child: const Icon(Icons.support_agent_rounded),
      ),
      bottomNavigationBar: Theme(
        data: Theme.of(context).copyWith(
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onTabTapped,
          type: BottomNavigationBarType.fixed,
          backgroundColor: context.appColors.surface,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: context.appColors.textTertiary,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700),
          elevation: 0,
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.home_rounded),
              activeIcon: Icon(Icons.home_rounded),
              label: 'Inicio',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.history_rounded),
              activeIcon: Icon(Icons.history_rounded),
              label: 'Historial',
            ),
            BottomNavigationBarItem(
              icon: Container(
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(
                  color: AppColors.emergency,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.warning_amber_rounded,
                  color: Colors.white,
                  size: 26,
                ),
              ),
              label: 'SOS',
            ),
            BottomNavigationBarItem(
              icon: Badge(
                isLabelVisible: _unreadCount > 0,
                label: Text(
                  '$_unreadCount',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                backgroundColor: AppColors.accent,
                child: const Icon(Icons.notifications_rounded),
              ),
              activeIcon: Badge(
                isLabelVisible: _unreadCount > 0,
                label: Text(
                  '$_unreadCount',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                backgroundColor: AppColors.accent,
                child: const Icon(Icons.notifications_rounded),
              ),
              label: 'Alertas',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.person_rounded),
              activeIcon: Icon(Icons.person_rounded),
              label: 'Perfil',
            ),
          ],
        ),
      ),
    );
  }
}
