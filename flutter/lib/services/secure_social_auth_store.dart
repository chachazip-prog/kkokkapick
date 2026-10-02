import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'authentication.dart';
import 'social_auth.dart';

final class SecurePendingSocialAuthStore implements PendingSocialAuthStore {
  SecurePendingSocialAuthStore({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
              iOptions: IOSOptions(
                accessibility: KeychainAccessibility.first_unlock_this_device,
              ),
            );

  static const _key = 'auth_social_pkce_pending';
  final FlutterSecureStorage _storage;

  @override
  Future<PendingSocialAuth?> read() async {
    final raw = await _storage.read(key: _key);
    if (raw == null || raw.isEmpty) return null;
    try {
      final value = jsonDecode(raw);
      if (value is! Map) return null;
      final methodName = value['method'];
      final verifier = value['verifier'];
      final createdAt = value['createdAt'];
      if (methodName is! String ||
          verifier is! String ||
          verifier.isEmpty ||
          createdAt is! String) {
        return null;
      }
      final method = AuthMethod.values.where((m) => m.name == methodName).firstOrNull;
      final timestamp = DateTime.tryParse(createdAt);
      if (method == null || !method.isSocial || timestamp == null) return null;
      return PendingSocialAuth(
        method: method,
        codeVerifier: verifier,
        createdAt: timestamp.toUtc(),
      );
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> write(PendingSocialAuth pending) =>
      _storage.write(
        key: _key,
        value: jsonEncode({
          'method': pending.method.name,
          'verifier': pending.codeVerifier,
          'createdAt': pending.createdAt.toUtc().toIso8601String(),
        }),
      );

  @override
  Future<void> clear() => _storage.delete(key: _key);
}
