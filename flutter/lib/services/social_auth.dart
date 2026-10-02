import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';

import 'authentication.dart';

const socialAuthCallbackUri = 'kkokkapick://auth/callback';

final class SocialAuthProviderConfiguration {
  const SocialAuthProviderConfiguration({
    required this.enabledMethods,
    required this.providerIds,
    this.callbackUri = socialAuthCallbackUri,
  });

  factory SocialAuthProviderConfiguration.fromEnvironment() {
    const raw = String.fromEnvironment('SOCIAL_AUTH_PROVIDERS');
    const naverId = String.fromEnvironment('NAVER_SUPABASE_PROVIDER_ID');
    final enabled = <AuthMethod>{};
    for (final value in raw.split(',').map((v) => v.trim().toLowerCase())) {
      switch (value) {
        case 'google':
          enabled.add(AuthMethod.google);
          break;
        case 'kakao':
          enabled.add(AuthMethod.kakao);
          break;
        case 'naver':
          enabled.add(AuthMethod.naver);
          break;
        case 'apple':
          enabled.add(AuthMethod.apple);
          break;
      }
    }
    return SocialAuthProviderConfiguration(
      enabledMethods: enabled,
      providerIds: {
        AuthMethod.google: 'google',
        AuthMethod.kakao: 'kakao',
        AuthMethod.apple: 'apple',
        if (naverId.trim().isNotEmpty) AuthMethod.naver: naverId.trim(),
      },
    );
  }

  final Set<AuthMethod> enabledMethods;
  final Map<AuthMethod, String> providerIds;
  final String callbackUri;

  bool isEnabled(AuthMethod method) =>
      method.isSocial &&
      enabledMethods.contains(method) &&
      (providerIds[method]?.trim().isNotEmpty ?? false);

  String providerId(AuthMethod method) {
    if (!isEnabled(method)) throw const AuthConfigurationRequired();
    return providerIds[method]!;
  }

  Uri get callback {
    final uri = Uri.parse(callbackUri);
    if (uri.scheme != 'kkokkapick' || uri.host != 'auth' || uri.path != '/callback') {
      throw StateError('Invalid social authentication callback URI.');
    }
    return uri;
  }
}

final class PendingSocialAuth {
  const PendingSocialAuth({
    required this.method,
    required this.codeVerifier,
    required this.createdAt,
  });

  final AuthMethod method;
  final String codeVerifier;
  final DateTime createdAt;
}

abstract interface class PendingSocialAuthStore {
  Future<PendingSocialAuth?> read();
  Future<void> write(PendingSocialAuth pending);
  Future<void> clear();
}

final class SocialAuthPkce {
  SocialAuthPkce({Random? random}) : _random = random ?? Random.secure();

  static const _alphabet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  final Random _random;

  String createVerifier({int length = 64}) {
    if (length < 43 || length > 128) {
      throw ArgumentError.value(length, 'length', 'PKCE verifier must be 43-128 characters.');
    }
    return List.generate(
      length,
      (_) => _alphabet[_random.nextInt(_alphabet.length)],
    ).join();
  }

  String challenge(String verifier) {
    final digest = sha256.convert(utf8.encode(verifier));
    return base64Url.encode(digest.bytes).replaceAll('=', '');
  }
}

final class SocialAuthCallback {
  const SocialAuthCallback._({this.code, this.errorCode});

  final String? code;
  final String? errorCode;

  static SocialAuthCallback parse(Uri uri, Uri expectedCallback) {
    if (uri.scheme != expectedCallback.scheme ||
        uri.host != expectedCallback.host ||
        uri.path != expectedCallback.path) {
      throw const SocialAuthCallbackInvalid();
    }
    final error = uri.queryParameters['error'];
    if (error != null && error.trim().isNotEmpty) {
      return SocialAuthCallback._(errorCode: error.trim());
    }
    final code = uri.queryParameters['code'];
    if (code == null || code.trim().isEmpty) {
      throw const SocialAuthCallbackInvalid();
    }
    return SocialAuthCallback._(code: code.trim());
  }
}

final class SocialAuthCallbackInvalid implements Exception {
  const SocialAuthCallbackInvalid();
}

final class SocialAuthFlowUnavailable implements Exception {
  const SocialAuthFlowUnavailable();
}

final class SocialAuthFlowExpired implements Exception {
  const SocialAuthFlowExpired();
}

final class SocialAuthProviderError implements Exception {
  const SocialAuthProviderError(this.code);
  final String code;
  @override
  String toString() => 'SocialAuthProviderError(code: $code)';
}

final class SocialAuthLaunchException implements Exception {
  const SocialAuthLaunchException();
}
