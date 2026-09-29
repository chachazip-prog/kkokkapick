import 'account_sync.dart';
import 'account_mutation_outbox.dart';
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
    AccountMutationOutbox? outbox,
  }):outbox=outbox??AccountMutationOutbox() {
    session=AuthenticationSessionBridge(authentication);
    account=(accountFactory??((session)=>SupabaseAccountGateway(
      baseUrl:supabaseUrl,
      anonKey:anonKey,
      session:session,
    )))(session);
  }

  final SupabaseAuthenticationGateway authentication;
  final LocalAccountDataStore localData;
  final AccountMutationOutbox outbox;
  late final AuthenticationSessionBridge session;
  late final SupabaseAccountGateway account;

  Future<AppSessionBootstrapResult> restore() async {
    final restored=await authentication.restoreSession();
    if(!restored)return const AppSessionBootstrapResult(AppSessionState.guest);
    try {
      final remote=await account.fetch();
      await replayPendingMutations();
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

  Future<void> setFavorite(String productId,bool favorite)=>_sendOrQueue(
    PendingAccountMutation(AccountMutationKind.favorite,productId,{'favorite':favorite}));
  Future<void> setPriceAlert(String productId,int? targetPrice)=>_sendOrQueue(
    PendingAccountMutation(AccountMutationKind.priceAlert,productId,{'targetPrice':targetPrice}));
  Future<void> setChildProfile(Map<String,Object?>? profile)=>_sendOrQueue(
    PendingAccountMutation(AccountMutationKind.childProfile,'profile',{'profile':profile}));

  Future<void> _send(PendingAccountMutation m) {
    switch(m.kind){
      case AccountMutationKind.favorite:return account.setFavorite(m.key,m.payload['favorite'] as bool);
      case AccountMutationKind.priceAlert:return account.setPriceAlert(m.key,m.payload['targetPrice'] as int?);
      case AccountMutationKind.childProfile:return account.setChildProfile(m.payload['profile'] as Map<String,Object?>?);
    }
  }

  String get _outboxOwner=>session.accessToken??'guest';

  Future<void> _sendOrQueue(PendingAccountMutation m) async {
    final owner=_outboxOwner;
    await outbox.put(m,owner);
    try{await _send(m);await outbox.remove(m.kind,m.key,owner);}catch(_){rethrow;}
  }

  Future<void> replayPendingMutations() async {
    final owner=_outboxOwner;
    for(final m in await outbox.load(owner)){
      try{await _send(m);await outbox.remove(m.kind,m.key,owner);}catch(_){/* retain for later retry */}
    }
  }

  Future<void> deleteAppData() async {
    await AccountSyncCoordinator(account).deleteAppData();
    await localData.clearAppData();
    await outbox.clear(_outboxOwner);
  }

  Future<void> signOut()=>authentication.clearSession();
}
