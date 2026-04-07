import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class ApiService {
  // Cambiar a la IP de tu PC si pruebas en dispositivo fisico
  static const String baseUrl = 'http://10.0.2.2:8000/api';

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<Map<String, String>> _headers() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // AUTH
  static Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String fullName,
    required String phone,
  }) async {
    final resp = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'full_name': fullName,
        'phone': phone,
        'role': 'client',
      }),
    );
    if (resp.statusCode == 201) {
      final data = jsonDecode(resp.body);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['access_token']);
      await prefs.setString('user', jsonEncode(data['user']));
      return data;
    }
    String detail;
    try {
      detail = jsonDecode(resp.body)['detail'] ?? 'Error al registrarse';
    } catch (_) {
      detail = 'Error del servidor (${resp.statusCode})';
    }
    throw Exception(detail);
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final resp = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (resp.statusCode == 200) {
      final data = jsonDecode(resp.body);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['access_token']);
      await prefs.setString('user', jsonEncode(data['user']));
      return data;
    }
    String detail;
    try {
      detail = jsonDecode(resp.body)['detail'] ?? 'Credenciales incorrectas';
    } catch (_) {
      detail = 'Error del servidor (${resp.statusCode})';
    }
    throw Exception(detail);
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') != null;
  }

  static Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('user');
    if (userStr != null) return User.fromJson(jsonDecode(userStr));
    return null;
  }

  // VEHICLES
  static Future<List<Vehicle>> getVehicles() async {
    final resp = await http.get(
      Uri.parse('$baseUrl/vehicles/'),
      headers: await _headers(),
    );
    if (resp.statusCode == 200) {
      return (jsonDecode(resp.body) as List)
          .map((v) => Vehicle.fromJson(v))
          .toList();
    }
    throw Exception('Error al obtener vehiculos');
  }

  static Future<Vehicle> createVehicle(Map<String, dynamic> data) async {
    final resp = await http.post(
      Uri.parse('$baseUrl/vehicles/'),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (resp.statusCode == 201) return Vehicle.fromJson(jsonDecode(resp.body));
    throw Exception(jsonDecode(resp.body)['detail'] ?? 'Error al crear vehiculo');
  }

  // INCIDENTS
  static Future<Incident> createIncident({
    required int vehicleId,
    required double latitude,
    required double longitude,
    String? address,
    String? description,
  }) async {
    final resp = await http.post(
      Uri.parse('$baseUrl/incidents/'),
      headers: await _headers(),
      body: jsonEncode({
        'vehicle_id': vehicleId,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'description': description,
      }),
    );
    if (resp.statusCode == 201) return Incident.fromJson(jsonDecode(resp.body));
    throw Exception('Error al crear incidente');
  }

  static Future<List<Incident>> getIncidents() async {
    final resp = await http.get(
      Uri.parse('$baseUrl/incidents/'),
      headers: await _headers(),
    );
    if (resp.statusCode == 200) {
      return (jsonDecode(resp.body) as List)
          .map((i) => Incident.fromJson(i))
          .toList();
    }
    throw Exception('Error al obtener incidentes');
  }

  static Future<Incident> getIncident(int id) async {
    final resp = await http.get(
      Uri.parse('$baseUrl/incidents/$id'),
      headers: await _headers(),
    );
    if (resp.statusCode == 200) return Incident.fromJson(jsonDecode(resp.body));
    throw Exception('Incidente no encontrado');
  }

  static Future<Incident> uploadImage(int incidentId, File file) async {
    final token = await _getToken();
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/incidents/$incidentId/evidence/image'),
    );
    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(await http.MultipartFile.fromPath('file', file.path));
    final streamResp = await request.send();
    final resp = await http.Response.fromStream(streamResp);
    if (resp.statusCode == 200) return Incident.fromJson(jsonDecode(resp.body));
    throw Exception('Error al subir imagen');
  }

  static Future<Incident> uploadAudio(int incidentId, File file) async {
    final token = await _getToken();
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/incidents/$incidentId/evidence/audio'),
    );
    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(await http.MultipartFile.fromPath('file', file.path));
    final streamResp = await request.send();
    final resp = await http.Response.fromStream(streamResp);
    if (resp.statusCode == 200) return Incident.fromJson(jsonDecode(resp.body));
    throw Exception('Error al subir audio');
  }

  // NOTIFICATIONS
  static Future<List<AppNotification>> getNotifications() async {
    final resp = await http.get(
      Uri.parse('$baseUrl/notifications/'),
      headers: await _headers(),
    );
    if (resp.statusCode == 200) {
      return (jsonDecode(resp.body) as List)
          .map((n) => AppNotification.fromJson(n))
          .toList();
    }
    throw Exception('Error al obtener notificaciones');
  }

  // PAYMENTS
  static Future<void> createPayment({
    required int incidentId,
    required double amount,
    String method = 'card',
  }) async {
    final resp = await http.post(
      Uri.parse('$baseUrl/payments/'),
      headers: await _headers(),
      body: jsonEncode({
        'incident_id': incidentId,
        'amount': amount,
        'payment_method': method,
      }),
    );
    if (resp.statusCode != 201) {
      throw Exception(jsonDecode(resp.body)['detail'] ?? 'Error en el pago');
    }
  }
}
