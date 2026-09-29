import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:kkokkapick/services/authentication.dart';
import 'package:kkokkapick/services/supabase_authentication_gateway.dart';

final class _Store implements SessionTokenStore{
  StoredSessionTokens? value;
  @override Future<StoredSessionTokens?> read()async=>value;
  @override Future<void> write(StoredSessionTokens tokens)async{value=tokens;}
  @override Future<void> clear()async{value=null;}
}

void main(){
  test('restores stored refresh token and rotates persisted session',()async{
    final store=_Store()..value=const StoredSessionTokens(accessToken:'old-access',refreshToken:'old-refresh');
    final client=MockClient((r)async{
      expect(r.url.queryParameters['grant_type'],'refresh_token');
      expect(r.body,contains('old-refresh'));
      return http.Response('{"access_token":"new-access","refresh_token":"new-refresh"}',200);
    });
    final g=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public',tokenStore:store,client:client);
    expect(await g.restoreSession(),isTrue);
    expect(g.tokens?.accessToken,'new-access');expect(store.value?.refreshToken,'new-refresh');
  });
  test('failed restore clears invalid stored session',()async{
    final store=_Store()..value=const StoredSessionTokens(accessToken:'old',refreshToken:'bad');
    final g=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public',tokenStore:store,client:MockClient((_)async=>http.Response('{}',401)));
    expect(await g.restoreSession(),isFalse);expect(g.tokens,isNull);expect(store.value,isNull);
  });
  test('transient restore failure preserves persisted refresh token',()async{
    final store=_Store()..value=const StoredSessionTokens(accessToken:'old',refreshToken:'keep-me');
    final g=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public',tokenStore:store,client:MockClient((_)async=>http.Response('{}',503)));
    await expectLater(g.restoreSession(),throwsA(isA<AuthenticationException>()));
    expect(g.tokens,isNull);
    expect(store.value?.refreshToken,'keep-me');
  });
  test('malformed successful refresh payload is rejected without deleting stored session',()async{
    final store=_Store()..value=const StoredSessionTokens(accessToken:'old',refreshToken:'keep-me');
    final g=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public',tokenStore:store,client:MockClient((_)async=>http.Response('{bad json',200)));
    await expectLater(g.restoreSession(),throwsA(isA<AuthenticationPayloadException>()));
    expect(g.tokens,isNull);
    expect(store.value?.refreshToken,'keep-me');
  });
  test('signup without session tokens is valid pending-confirmation response',()async{
    final store=_Store();
    final g=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public',tokenStore:store,client:MockClient((_)async=>http.Response('{"user":{"id":"u1"}}',200)));
    await g.createEmailAccount(email:'user@example.com',password:'secret');
    expect(g.tokens,isNull);
    expect(store.value,isNull);
  });
  test('email sign-in rejects tokenless successful response',()async{
    final g=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public',client:MockClient((_)async=>http.Response('{"user":{"id":"u1"}}',200)));
    await expectLater(g.signInWithEmail(email:'user@example.com',password:'secret'),throwsA(isA<AuthenticationPayloadException>()));
  });
  test('email sign-in uses Supabase password grant without secret credentials',()async{
    final client=MockClient((r)async{
      expect(r.url.path,endsWith('/auth/v1/token'));
      expect(r.url.queryParameters['grant_type'],'password');
      expect(r.headers['apikey'],'public-anon');
      expect(r.body,contains('user@example.com'));
      return http.Response('{"access_token":"token","refresh_token":"refresh"}',200);
    });
    await SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public-anon',client:client)
      .signInWithEmail(email:'user@example.com',password:'secret');
  });
  test('email signup uses public signup endpoint',()async{
    final client=MockClient((r)async{
      expect(r.url.path,endsWith('/auth/v1/signup'));
      return http.Response('{"access_token":"signup-access","refresh_token":"signup-refresh"}',200);
    });
    final store=_Store();
    await SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public-anon',tokenStore:store,client:client)
      .createEmailAccount(email:'user@example.com',password:'secret');
    expect(store.value?.accessToken,'signup-access');
    expect(store.value?.refreshToken,'signup-refresh');
  });
  test('social auth remains closed until callback/provider config exists',()async{
    final g=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public');
    expect(()=>g.signInWithSocial(AuthMethod.apple),throwsA(isA<AuthConfigurationRequired>()));
  });
  test('missing public configuration fails before request',()async{
    final g=SupabaseAuthenticationGateway(baseUrl:'',anonKey:'');
    expect(()=>g.signInWithEmail(email:'a@b.com',password:'x'),throwsA(isA<StateError>()));
  });
  test('captures, refreshes, and clears authenticated session tokens',()async{
    var refresh=false;
    final client=MockClient((r)async{
      if(r.url.queryParameters['grant_type']=='refresh_token'){
        refresh=true;expect(r.body,contains('refresh-1'));
        return http.Response('{"access_token":"access-2","refresh_token":"refresh-2"}',200);
      }
      return http.Response('{"access_token":"access-1","refresh_token":"refresh-1"}',200);
    });
    final g=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public',client:client);
    await g.signInWithEmail(email:'user@example.com',password:'secret');
    expect(g.tokens?.accessToken,'access-1');
    await g.refreshSession();
    expect(refresh,isTrue);expect(g.tokens?.accessToken,'access-2');
    await g.clearSession();expect(g.tokens,isNull);
  });
  test('refresh requires an existing authenticated session',()async{
    final g=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public');
    expect(()=>g.refreshSession(),throwsA(isA<AuthSessionUnavailable>()));
  });
  test('captures stable user id from authenticated payload',() async{
    final store=_Store();
    final gateway=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public',tokenStore:store,
      client:MockClient((r)async=>http.Response('{"access_token":"a","refresh_token":"r","user":{"id":"user-123"}}',200)));
    await gateway.signInWithEmail(email:'a@b.com',password:'password');
    expect(gateway.tokens?.userId,'user-123');
  });
}
