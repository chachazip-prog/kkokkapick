import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:kkokkapick/services/authentication_session_bridge.dart';
import 'package:kkokkapick/services/supabase_authentication_gateway.dart';

void main(){
  test('bridge is guest until authentication has an access token',(){
    final auth=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public');
    final bridge=AuthenticationSessionBridge(auth);
    expect(bridge.isAuthenticated,isFalse);expect(bridge.accessToken,isNull);
  });
  test('bridge exposes current rotated access token only',()async{
    var refresh=false;
    final auth=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public',client:MockClient((r)async{
      if(r.url.queryParameters['grant_type']=='refresh_token'){
        refresh=true;return http.Response('{"access_token":"access-2","refresh_token":"refresh-2"}',200);
      }
      return http.Response('{"access_token":"access-1","refresh_token":"refresh-1"}',200);
    }));
    final bridge=AuthenticationSessionBridge(auth);
    await auth.signInWithEmail(email:'u@example.com',password:'secret');
    expect(bridge.isAuthenticated,isTrue);expect(bridge.accessToken,'access-1');
    await auth.refreshSession();
    expect(refresh,isTrue);expect(bridge.accessToken,'access-2');
    await auth.clearSession();
    expect(bridge.isAuthenticated,isFalse);expect(bridge.accessToken,isNull);
  });
}
