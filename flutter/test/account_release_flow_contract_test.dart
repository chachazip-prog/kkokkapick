import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:kkokkapick/services/authentication_session_bridge.dart';
import 'package:kkokkapick/services/supabase_account_gateway.dart';
import 'package:kkokkapick/services/supabase_authentication_gateway.dart';

void main(){
  test('authenticated release flow keeps all account mutations on bearer-scoped RPCs',() async {
    final calls=<String>[];
    final bodies=<String,Map<String,dynamic>>{};
    final auth=SupabaseAuthenticationGateway(
      baseUrl:'https://example.supabase.co',anonKey:'public-anon',
      client:MockClient((r) async => http.Response('{"access_token":"user-token","refresh_token":"refresh","user":{"id":"u1"}}',200)),
    );
    await auth.signInWithEmail(email:'u@example.com',password:'secret');
    final account=SupabaseAccountGateway(
      baseUrl:'https://example.supabase.co',anonKey:'public-anon',
      session:AuthenticationSessionBridge(auth),
      client:MockClient((r) async {
        expect(r.headers['authorization'],'Bearer user-token');
        expect(r.headers['apikey'],'public-anon');
        final name=r.url.pathSegments.last;
        calls.add(name);
        bodies[name]=r.body.isEmpty?<String,dynamic>{}:Map<String,dynamic>.from(jsonDecode(r.body) as Map);
        if(name=='get_my_app_data')return http.Response('{"favoriteProductIds":[],"profile":null,"priceAlerts":[]}',200);
        return http.Response('{}',200);
      }),
    );

    await account.fetch();
    await account.setFavorite('p1',true);
    await account.setChildProfile({'months':8,'heightCm':72,'weightKg':8.5});
    await account.setPriceAlert('p1',15000);
    await account.deleteAppData();
    await account.deleteAccountIdentity();

    expect(calls,[
      'get_my_app_data','set_my_favorite','set_my_child_profile',
      'set_my_price_alert','delete_my_app_data','delete_my_account'
    ]);
    expect(bodies['set_my_favorite'],{'p_product_id':'p1','p_favorite':true});
    expect(bodies['set_my_price_alert'],{'p_product_id':'p1','p_target_price':15000});
    expect(bodies['delete_my_account'],isEmpty);
  });

  test('guest cannot execute account mutation flow',() async {
    final auth=SupabaseAuthenticationGateway(baseUrl:'https://example.supabase.co',anonKey:'public-anon');
    final account=SupabaseAccountGateway(baseUrl:'https://example.supabase.co',anonKey:'public-anon',session:AuthenticationSessionBridge(auth));
    expect(()=>account.setFavorite('p1',true),throwsA(isA<StateError>()));
    expect(()=>account.deleteAccountIdentity(),throwsA(isA<StateError>()));
  });
}
