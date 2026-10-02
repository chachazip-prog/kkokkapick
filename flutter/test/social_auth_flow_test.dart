import 'dart:async';
import 'dart:math';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:kkokkapick/services/authentication.dart';
import 'package:kkokkapick/services/social_auth.dart';
import 'package:kkokkapick/services/social_auth_callback_router.dart';
import 'package:kkokkapick/services/social_auth_launcher.dart';
import 'package:kkokkapick/services/supabase_authentication_gateway.dart';

final class _PendingStore implements PendingSocialAuthStore {
  PendingSocialAuth? value;
  int clears = 0;
  @override Future<PendingSocialAuth?> read() async => value;
  @override Future<void> write(PendingSocialAuth pending) async { value = pending; }
  @override Future<void> clear() async { value = null; clears++; }
}

final class _TokenStore implements SessionTokenStore {
  StoredSessionTokens? value;
  @override Future<StoredSessionTokens?> read() async => value;
  @override Future<void> write(StoredSessionTokens tokens) async { value = tokens; }
  @override Future<void> clear() async { value = null; }
}

final class _LinkSource implements SocialAuthLinkSource {
  final controller = StreamController<Uri>();
  @override Stream<Uri> get uriLinks => controller.stream;
}

String _verifier() => List.filled(64, 'v').join();

SocialAuthProviderConfiguration _config([Set<AuthMethod>? enabled]) =>
    SocialAuthProviderConfiguration(
      enabledMethods: enabled ?? {AuthMethod.google},
      providerIds: const {
        AuthMethod.google: 'google',
        AuthMethod.apple: 'apple',
        AuthMethod.kakao: 'kakao',
        AuthMethod.naver: 'custom:naver',
      },
    );

void main() {
  test('PKCE verifier and challenge use safe lengths and base64url', () {
    final pkce = SocialAuthPkce(random: Random(7));
    final verifier = pkce.createVerifier();
    final challenge = pkce.challenge(verifier);
    expect(verifier.length, 64);
    expect(RegExp(r'^[A-Za-z0-9\-._~]+$').hasMatch(verifier), isTrue);
    expect(challenge.length, 43);
    expect(challenge, isNot(contains('=')));
  });

  test('provider configuration defaults disabled when method is not enabled', () {
    final config = _config({});
    expect(config.isEnabled(AuthMethod.google), isFalse);
    expect(() => config.providerId(AuthMethod.google), throwsA(isA<AuthConfigurationRequired>()));
    expect(config.callback.toString(), socialAuthCallbackUri);
  });

  test('prepare social sign-in persists verifier and builds Supabase PKCE authorize URL', () async {
    final pending = _PendingStore();
    final gateway = SupabaseAuthenticationGateway(
      baseUrl: 'https://project.supabase.co',
      anonKey: 'public',
      socialFlowStore: pending,
      socialConfiguration: _config(),
      socialPkce: SocialAuthPkce(random: Random(1)),
    );
    final uri = await gateway.prepareSocialSignIn(
      AuthMethod.google,
      now: DateTime.utc(2026, 10, 3, 1),
    );
    expect(uri.path, '/auth/v1/authorize');
    expect(uri.queryParameters['provider'], 'google');
    expect(uri.queryParameters['redirect_to'], socialAuthCallbackUri);
    expect(uri.queryParameters['code_challenge_method'], 's256');
    expect(uri.queryParameters['code_challenge'], isNotEmpty);
    expect(pending.value?.method, AuthMethod.google);
    expect(pending.value?.codeVerifier.length, 64);
  });

  test('disabled provider cannot create a pending flow', () async {
    final pending = _PendingStore();
    final gateway = SupabaseAuthenticationGateway(
      baseUrl: 'https://project.supabase.co',
      anonKey: 'public',
      socialFlowStore: pending,
      socialConfiguration: _config({}),
    );
    await expectLater(
      gateway.prepareSocialSignIn(AuthMethod.google),
      throwsA(isA<AuthConfigurationRequired>()),
    );
    expect(pending.value, isNull);
  });

  test('valid callback exchanges auth code with saved PKCE verifier and stores session', () async {
    final pending = _PendingStore()
      ..value = PendingSocialAuth(
        method: AuthMethod.google,
        codeVerifier: _verifier(),
        createdAt: DateTime.utc(2026, 10, 3, 1),
      );
    final tokens = _TokenStore();
    final client = MockClient((request) async {
      expect(request.url.path, endsWith('/auth/v1/token'));
      expect(request.url.queryParameters['grant_type'], 'pkce');
      expect(request.headers['apikey'], 'public');
      expect(request.body, contains('"auth_code":"oauth-code"'));
      expect(request.body, contains('"code_verifier":"NaN"'));
      return http.Response(
        '{"access_token":"access","refresh_token":"refresh","user":{"id":"u1"}}',
        200,
      );
    });
    final gateway = SupabaseAuthenticationGateway(
      baseUrl: 'https://project.supabase.co',
      anonKey: 'public',
      tokenStore: tokens,
      socialFlowStore: pending,
      socialConfiguration: _config(),
      client: client,
    );
    await gateway.completeSocialSignIn(
      Uri.parse('$socialAuthCallbackUri?code=oauth-code'),
      now: DateTime.utc(2026, 10, 3, 1, 5),
    );
    expect(tokens.value?.accessToken, 'access');
    expect(tokens.value?.refreshToken, 'refresh');
    expect(tokens.value?.userId, 'u1');
    expect(pending.value, isNull);
  });

  test('provider callback error clears pending flow without exchanging a token', () async {
    var requested = false;
    final pending = _PendingStore()
      ..value = PendingSocialAuth(
        method: AuthMethod.google,
        codeVerifier: _verifier(),
        createdAt: DateTime.utc(2026, 10, 3, 1),
      );
    final gateway = SupabaseAuthenticationGateway(
      baseUrl: 'https://project.supabase.co',
      anonKey: 'public',
      socialFlowStore: pending,
      socialConfiguration: _config(),
      client: MockClient((_) async {
        requested = true;
        return http.Response('{}', 500);
      }),
    );
    await expectLater(
      gateway.completeSocialSignIn(
        Uri.parse('$socialAuthCallbackUri?error=access_denied'),
        now: DateTime.utc(2026, 10, 3, 1, 1),
      ),
      throwsA(isA<SocialAuthProviderError>()),
    );
    expect(requested, isFalse);
    expect(pending.value, isNull);
  });

  test('wrong callback is rejected and does not consume pending flow', () async {
    final pending = _PendingStore()
      ..value = PendingSocialAuth(
        method: AuthMethod.google,
        codeVerifier: _verifier(),
        createdAt: DateTime.utc(2026, 10, 3, 1),
      );
    final gateway = SupabaseAuthenticationGateway(
      baseUrl: 'https://project.supabase.co',
      anonKey: 'public',
      socialFlowStore: pending,
      socialConfiguration: _config(),
    );
    await expectLater(
      gateway.completeSocialSignIn(
        Uri.parse('evil://auth/callback?code=stolen'),
        now: DateTime.utc(2026, 10, 3, 1, 1),
      ),
      throwsA(isA<SocialAuthCallbackInvalid>()),
    );
    expect(pending.value, isNotNull);
  });

  test('expired pending flow is cleared before callback exchange', () async {
    final pending = _PendingStore()
      ..value = PendingSocialAuth(
        method: AuthMethod.google,
        codeVerifier: _verifier(),
        createdAt: DateTime.utc(2026, 10, 3, 1),
      );
    final gateway = SupabaseAuthenticationGateway(
      baseUrl: 'https://project.supabase.co',
      anonKey: 'public',
      socialFlowStore: pending,
      socialConfiguration: _config(),
    );
    await expectLater(
      gateway.completeSocialSignIn(
        Uri.parse('$socialAuthCallbackUri?code=late'),
        now: DateTime.utc(2026, 10, 3, 1, 16),
      ),
      throwsA(isA<SocialAuthFlowExpired>()),
    );
    expect(pending.value, isNull);
  });

  test('transient token exchange failure keeps verifier for a retry', () async {
    final pending = _PendingStore()
      ..value = PendingSocialAuth(
        method: AuthMethod.google,
        codeVerifier: _verifier(),
        createdAt: DateTime.utc(2026, 10, 3, 1),
      );
    final gateway = SupabaseAuthenticationGateway(
      baseUrl: 'https://project.supabase.co',
      anonKey: 'public',
      socialFlowStore: pending,
      socialConfiguration: _config(),
      client: MockClient((_) async => http.Response('{}', 503)),
    );
    await expectLater(
      gateway.completeSocialSignIn(
        Uri.parse('$socialAuthCallbackUri?code=retryable'),
        now: DateTime.utc(2026, 10, 3, 1, 1),
      ),
      throwsA(isA<AuthenticationException>()),
    );
    expect(pending.value, isNotNull);
  });

  test('launcher clears pending flow when external browser launch fails', () async {
    final pending = _PendingStore();
    final gateway = SupabaseAuthenticationGateway(
      baseUrl: 'https://project.supabase.co',
      anonKey: 'public',
      socialFlowStore: pending,
      socialConfiguration: _config(),
      socialPkce: SocialAuthPkce(random: Random(3)),
    );
    final launcher = SocialAuthLauncher(
      authentication: gateway,
      launch: (_) async => false,
    );
    await expectLater(
      launcher.start(AuthMethod.google),
      throwsA(isA<SocialAuthLaunchException>()),
    );
    expect(pending.value, isNull);
  });

  test('callback router ignores non-callback links and completes a pending callback', () async {
    final pending = _PendingStore()
      ..value = PendingSocialAuth(
        method: AuthMethod.google,
        codeVerifier: _verifier(),
        createdAt: DateTime.now().toUtc(),
      );
    final tokens = _TokenStore();
    final source = _LinkSource();
    final done = Completer<void>();
    final gateway = SupabaseAuthenticationGateway(
      baseUrl: 'https://project.supabase.co',
      anonKey: 'public',
      tokenStore: tokens,
      socialFlowStore: pending,
      socialConfiguration: _config(),
      client: MockClient((_) async => http.Response(
        '{"access_token":"a","refresh_token":"r","user":{"id":"u"}}',
        200,
      )),
    );
    final router = SocialAuthCallbackRouter(
      authentication: gateway,
      source: source,
      onAuthenticated: () async {
        if (!done.isCompleted) done.complete();
      },
    )..start();

    source.controller.add(Uri.parse('https://example.com/not-auth'));
    await Future<void>.delayed(Duration.zero);
    expect(tokens.value, isNull);

    source.controller.add(Uri.parse('$socialAuthCallbackUri?code=ok'));
    await done.future.timeout(const Duration(seconds: 1));
    expect(tokens.value?.userId, 'u');

    await router.dispose();
    await source.controller.close();
  });
}
