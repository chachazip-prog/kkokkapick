import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:kkokkapick/services/authentication.dart';
import 'package:kkokkapick/services/supabase_authentication_gateway.dart';

void main(){
  test('email sign-in uses Supabase password grant without secret credentials',()async{
    final client=MockClient((r)async{
      expect(r.url.path,endsWith('/auth/v1/token'));
      expect(r.url.queryParameters['grant_type'],'password');
      expect(r.headers['apikey'],'public-anon');
      expect(r.body,contains('user@example.com'));
      return http.Response('{"access_token":"token"}',200);
    });
    await SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public-anon',client:client)
      .signInWithEmail(email:'user@example.com',password:'secret');
  });
  test('email signup uses public signup endpoint',()async{
    final client=MockClient((r)async{
      expect(r.url.path,endsWith('/auth/v1/signup'));
      return http.Response('{}',200);
    });
    await SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public-anon',client:client)
      .createEmailAccount(email:'user@example.com',password:'secret');
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
    g.clearSession();expect(g.tokens,isNull);
  });
  test('refresh requires an existing authenticated session',()async{
    final g=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public');
    expect(()=>g.refreshSession(),throwsA(isA<AuthSessionUnavailable>()));
  });
}
