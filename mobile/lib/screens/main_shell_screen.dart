import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_snackbar.dart';
import 'home_screen.dart';
import 'vehicles_screen.dart';
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

  final List<Widget> _screens = const [
    HomeScreen(),
    VehiclesScreen(),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
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
              icon: Icon(Icons.directions_car_rounded),
              activeIcon: Icon(Icons.directions_car_rounded),
              label: 'Vehiculos',
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
