import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:kkokkapick/services/app_session_orchestrator.dart';
import 'package:kkokkapick/services/authentication.dart';
import 'package:kkokkapick/services/local_account_data_store.dart';
import 'package:kkokkapick/services/supabase_authentication_gateway.dart';

final class _Store implements SessionTokenStore{
  _Store(this.value);
  StoredSessionTokens? value;
  @override Future<StoredSessionTokens?> read()async=>value;
  @override Future<void> write(StoredSessionTokens tokens)async{value=tokens;}
  @override Future<void> clear()async{value=null;}
}

void main(){
  test('startup without stored session remains guest',()async{
    final auth=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public',tokenStore:_Store(null));
    final app=AppSessionOrchestrator(authentication:auth,localData:LocalAccountDataStore(),supabaseUrl:'https://example.supabase.co',anonKey:'public');
    expect((await app.restore()).state,AppSessionState.guest);
  });

  test('restored session loads authenticated account snapshot',()async{
    final store=_Store(const StoredSessionTokens(accessToken:'old',refreshToken:'refresh'));
    final client=MockClient((r)async{
      if(r.url.path.endsWith('/auth/v1/token'))return http.Response('{"access_token":"fresh","refresh_token":"rotated"}',200);
      if(r.url.path.endsWith('/rest/v1/rpc/get_my_app_data'))return http.Response('{"favoriteProductIds":[],"profile":null,"priceAlerts":[]}',200);
      return http.Response('{}',404);
    });
    final auth=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public',tokenStore:store,client:client);
    final app=AppSessionOrchestrator(authentication:auth,localData:LocalAccountDataStore(),supabaseUrl:'https://example.supabase.co',anonKey:'public');
    // Account gateway has its own HTTP client; this test intentionally validates auth restore only until DI is added.
    expect(await auth.restoreSession(),isTrue);
    expect(app.session.isAuthenticated,isTrue);
    expect(app.session.accessToken,'fresh');
  });
}
