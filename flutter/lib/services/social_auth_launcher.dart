import 'package:url_launcher/url_launcher.dart';

import 'authentication.dart';
import 'social_auth.dart';
import 'supabase_authentication_gateway.dart';

typedef ExternalAuthLauncher = Future<bool> Function(Uri uri);

final class SocialAuthLauncher {
  SocialAuthLauncher({
    required this.authentication,
    ExternalAuthLauncher? launch,
  }) : _launch = launch ??
            ((uri) => launchUrl(
                  uri,
                  mode: LaunchMode.externalApplication,
                ));

  final SupabaseAuthenticationGateway authentication;
  final ExternalAuthLauncher _launch;

  Future<void> start(AuthMethod method) async {
    final uri = await authentication.prepareSocialSignIn(method);
    final launched = await _launch(uri);
    if (!launched) {
      await authentication.cancelPendingSocialSignIn();
      throw const SocialAuthLaunchException();
    }
  }
}
