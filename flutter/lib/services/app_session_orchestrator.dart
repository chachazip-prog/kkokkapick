import 'account_sync.dart';
import 'authentication_session_bridge.dart';
import 'local_account_data_store.dart';
import 'supabase_account_gateway.dart';
import 'supabase_authentication_gateway.dart';

enum AppSessionState { guest, restoring, authenticated, offlineAuthenticated }

final class AppSessionBootstrapResult {
  const AppSessionBootstrapResult(this.state,{this.remote});
  final AppSessionState state;
  final AccountSyncSnapshot? remote;
}

final class AppSessionOrchestrator {
  AppSessionOrchestrator({
    required this.authentication,
    required this.localData,
    required String supabaseUrl,
    required String anonKey,
    SupabaseAccountGateway Function(AuthenticationSessionBridge session)? accountFactory,
  }): session=AuthenticationSessionBridge(authentication),
      account=(accountFactory??((session)=>SupabaseAccountGateway(
        baseUrl:supabaseUrl,
        anonKey:anonKey,
        session:session,
      )))(AuthenticationSessionBridge(authentication));

  final SupabaseAuthenticationGateway authentication;
  final LocalAccountDataStore localData;
  final AuthenticationSessionBridge session;
  final SupabaseAccountGateway account;

  Future<AppSessionBootstrapResult> restore() async {
    final restored=await authentication.restoreSession();
    if(!restored)return const AppSessionBootstrapResult(AppSessionState.guest);
    try {
      final remote=await account.fetch();
      return AppSessionBootstrapResult(AppSessionState.authenticated,remote:remote);
    } on AccountGatewayException catch(e) {
      if(e.statusCode==401||e.statusCode==403){
        await authentication.clearSession();
        return const AppSessionBootstrapResult(AppSessionState.guest);
      }
      return const AppSessionBootstrapResult(AppSessionState.offlineAuthenticated);
    } catch (_) {
      return const AppSessionBootstrapResult(AppSessionState.offlineAuthenticated);
    }
  }

  Future<AccountSyncSnapshot?> applyFirstSignInChoice(FirstSignInDataChoice choice) async {
    final local=await localData.snapshot();
    return AccountSyncCoordinator(account).handleFirstAuthenticatedSession(choice:choice,local:local);
  }

  Future<void> signOut()=>authentication.clearSession();
}
