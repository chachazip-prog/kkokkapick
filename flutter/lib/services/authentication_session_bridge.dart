import 'account_sync.dart';
import 'supabase_authentication_gateway.dart';

final class AuthenticationSessionBridge implements AuthSession {
  const AuthenticationSessionBridge(this.authentication);
  final SupabaseAuthenticationGateway authentication;

  @override bool get isAuthenticated {
    final token=authentication.tokens?.accessToken;
    return token!=null&&token.isNotEmpty;
  }

  @override String? get accessToken=>authentication.tokens?.accessToken;
}
