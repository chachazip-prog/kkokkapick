import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:kkokkapick/services/app_session_orchestrator.dart';
import 'package:kkokkapick/services/authentication.dart';
import 'package:kkokkapick/services/local_account_data_store.dart';
import 'package:kkokkapick/services/supabase_account_gateway.dart';
import 'package:kkokkapick/services/supabase_authentication_gateway.dart';

final class _Store implements SessionTokenStore{
  _Store(this.value); StoredSessionTokens? value;
  @override Future<StoredSessionTokens?> read()async=>value;
  @override Future<void> write(StoredSessionTokens tokens)async{value=tokens;}
  @override Future<void> clear()async{value=null;}
}

SupabaseAuthenticationGateway _auth(_Store store,{int refreshStatus=200})=>SupabaseAuthenticationGateway(
  baseUrl:'https://example.supabase.co',anonKey:'public',tokenStore:store,
  client:MockClient((r)async=>http.Response(
    refreshStatus==200?'{"access_token":"fresh","refresh_token":"rotated"}':'{}',refreshStatus)));

void main(){
  test('startup without stored session remains guest',()async{
    final app=AppSessionOrchestrator(authentication:_auth(_Store(null)),localData:LocalAccountDataStore(),supabaseUrl:'https://example.supabase.co',anonKey:'public');
    expect((await app.restore()).state,AppSessionState.guest);
  });

  test('restored session loads account snapshot with rotated access token',()async{
    final auth=_auth(_Store(const StoredSessionTokens(accessToken:'old',refreshToken:'refresh')));
    final app=AppSessionOrchestrator(
      authentication:auth,localData:LocalAccountDataStore(),supabaseUrl:'https://example.supabase.co',anonKey:'public',
      accountFactory:(session)=>SupabaseAccountGateway(baseUrl:'https://example.supabase.co',anonKey:'public',session:session,
        client:MockClient((r)async{
          expect(r.headers['authorization'],'Bearer fresh');
          return http.Response('{"favoriteProductIds":["p1"],"profile":null,"priceAlerts":[]}',200);
        })));
    expect(identical(app.account.session,app.session),isTrue);
    final result=await app.restore();
    expect(result.state,AppSessionState.authenticated);
    expect(result.remote?.favoriteProductIds,{'p1'});
  });

  test('transient auth refresh failure preserves offline-authenticated session without activating stale token',()async{
    final store=_Store(const StoredSessionTokens(accessToken:'old',refreshToken:'refresh',userId:'u1'));
    final auth=_auth(store,refreshStatus:503);
    final app=AppSessionOrchestrator(authentication:auth,localData:LocalAccountDataStore(),supabaseUrl:'https://example.supabase.co',anonKey:'public');
    final result=await app.restore();
    expect(result.state,AppSessionState.offlineAuthenticated);
    expect(auth.tokens,isNull);
    expect(store.value?.userId,'u1');
  });

  test('invalid refresh credentials clear stored session and return guest',()async{
    final store=_Store(const StoredSessionTokens(accessToken:'old',refreshToken:'refresh',userId:'u1'));
    final auth=_auth(store,refreshStatus:401);
    final app=AppSessionOrchestrator(authentication:auth,localData:LocalAccountDataStore(),supabaseUrl:'https://example.supabase.co',anonKey:'public');
    expect((await app.restore()).state,AppSessionState.guest);
    expect(auth.tokens,isNull);
    expect(store.value,isNull);
  });

  test('transient account failure preserves authenticated session',()async{
    final store=_Store(const StoredSessionTokens(accessToken:'old',refreshToken:'refresh'));
    final auth=_auth(store);
    final app=AppSessionOrchestrator(authentication:auth,localData:LocalAccountDataStore(),supabaseUrl:'https://example.supabase.co',anonKey:'public',
      accountFactory:(session)=>SupabaseAccountGateway(baseUrl:'https://example.supabase.co',anonKey:'public',session:session,client:MockClient((_)async=>http.Response('{}',503))));
    expect((await app.restore()).state,AppSessionState.offlineAuthenticated);
    expect(auth.tokens,isNotNull);expect(store.value,isNotNull);
  });

  test('account authorization failure clears local authenticated session',()async{
    final store=_Store(const StoredSessionTokens(accessToken:'old',refreshToken:'refresh'));
    final auth=_auth(store);
    final app=AppSessionOrchestrator(authentication:auth,localData:LocalAccountDataStore(),supabaseUrl:'https://example.supabase.co',anonKey:'public',
      accountFactory:(session)=>SupabaseAccountGateway(baseUrl:'https://example.supabase.co',anonKey:'public',session:session,client:MockClient((_)async=>http.Response('{}',401))));
    expect((await app.restore()).state,AppSessionState.guest);
    expect(auth.tokens,isNull);expect(store.value,isNull);
  });
}
