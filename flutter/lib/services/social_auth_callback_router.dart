import 'dart:async';

import 'package:app_links/app_links.dart';

import 'social_auth.dart';
import 'supabase_authentication_gateway.dart';

abstract interface class SocialAuthLinkSource {
  Stream<Uri> get uriLinks;
}

final class AppLinksSocialAuthLinkSource implements SocialAuthLinkSource {
  AppLinksSocialAuthLinkSource({AppLinks? appLinks})
      : _appLinks = appLinks ?? AppLinks();

  final AppLinks _appLinks;

  @override
  Stream<Uri> get uriLinks => _appLinks.uriLinkStream;
}

final class SocialAuthCallbackRouter {
  SocialAuthCallbackRouter({
    required this.authentication,
    required this.source,
    required this.onAuthenticated,
    this.onError,
  });

  final SupabaseAuthenticationGateway authentication;
  final SocialAuthLinkSource source;
  final Future<void> Function() onAuthenticated;
  final void Function(Object error)? onError;

  StreamSubscription<Uri>? _subscription;
  bool _handling = false;

  void start() {
    _subscription ??= source.uriLinks.listen(_handle);
  }

  bool _isCallback(Uri uri) {
    Uri expected;
    try {
      expected = authentication.socialConfiguration.callback;
    } catch (_) {
      return false;
    }
    return uri.scheme == expected.scheme &&
        uri.host == expected.host &&
        uri.path == expected.path;
  }

  Future<void> _handle(Uri uri) async {
    if (!_isCallback(uri) || _handling) return;
    _handling = true;
    try {
      await authentication.completeSocialSignIn(uri);
      await onAuthenticated();
    } on SocialAuthFlowUnavailable {
      // A callback without a locally pending PKCE flow must never create a
      // session. Ignore it without exposing implementation details to the UI.
    } catch (error) {
      onError?.call(error);
    } finally {
      _handling = false;
    }
  }

  Future<void> dispose() async {
    await _subscription?.cancel();
    _subscription = null;
  }
}
