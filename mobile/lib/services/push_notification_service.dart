import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

/// Android notification channel for high-priority alerts.
const _androidChannel = AndroidNotificationChannel(
  'high_importance_channel',
  'Notificaciones de emergencia',
  description: 'Notificaciones de AsisteCar sobre tus emergencias vehiculares',
  importance: Importance.max,
);

/// Handles Firebase Cloud Messaging setup and token management.
class PushNotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  static bool _initialized = false;

  /// Request permissions and register the FCM token with the backend.
  static Future<void> init() async {
    if (_initialized) return;
    _initialized = true;

    // Create the Android notification channel
    await _localNotifications
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(_androidChannel);

    // Initialize local notifications (for foreground display)
    await _localNotifications.initialize(
      const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      ),
    );

    // Request permission (iOS will show a dialog, Android grants by default)
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      return;
    }

    // Show notifications even when app is in foreground (iOS/web)
    await _messaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    // Get FCM token and send it to the backend
    final token = await _messaging.getToken();
    if (token != null) {
      await _sendTokenToBackend(token);
    }

    // Listen for token refreshes
    _messaging.onTokenRefresh.listen(_sendTokenToBackend);

    // Handle foreground messages (Android won't auto-display these)
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle background/terminated message taps
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageTap);
  }

  static Future<void> _sendTokenToBackend(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final authToken = prefs.getString('token');
      if (authToken == null) return; // Not logged in yet

      await ApiService.updateFirebaseToken(token);
    } catch (_) {
      // Silently fail — will retry on next token refresh
    }
  }

  static void _handleForegroundMessage(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;

    // Show a local notification so the user sees it while in-app
    _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _androidChannel.id,
          _androidChannel.name,
          channelDescription: _androidChannel.description,
          importance: Importance.max,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
      ),
    );
  }

  static void _handleMessageTap(RemoteMessage message) {
    // User tapped on a notification — could navigate to a specific screen.
    // For now this is a no-op; add navigation logic as needed.
  }
}

/// Top-level handler required by Firebase for background messages.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // No-op: the OS displays the notification automatically.
}
