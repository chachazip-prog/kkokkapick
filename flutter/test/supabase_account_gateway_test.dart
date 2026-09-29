import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:kkokkapick/services/account_sync.dart';
import 'package:kkokkapick/services/supabase_account_gateway.dart';

final class _Session implements AuthSession{
  const _Session(this.token);
  final String? token;
  @override bool get isAuthenticated=>token!=null;
  @override String? get accessToken=>token;
  test('requires public Supabase configuration',()async{
    final g=SupabaseAccountGateway(baseUrl:'',anonKey:'',session:const _Session('user-token'),client:MockClient((_)async=>http.Response('{}',200)));
    expect(g.fetch(),throwsA(isA<StateError>()));
  });
  test('maps malformed success payload to safe domain error',()async{
    final g=SupabaseAccountGateway(baseUrl:'https://example.supabase.co',anonKey:'public',session:const _Session('user-token'),client:MockClient((_)async=>http.Response('<html>',200)));
    expect(g.fetch(),throwsA(isA<AccountPayloadException>()));
  });
  test('does not leak server response body in HTTP error',()async{
    final g=SupabaseAccountGateway(baseUrl:'https://example.supabase.co',anonKey:'public',session:const _Session('user-token'),client:MockClient((_)async=>http.Response('sensitive upstream details',401)));
    try{await g.fetch();fail('expected error');}on AccountGatewayException catch(e){expect(e.statusCode,401);expect(e.toString(),isNot(contains('sensitive')));}
  });
}

void main(){
  test('requires authenticated session before RPC',()async{
    final g=SupabaseAccountGateway(baseUrl:'https://example.supabase.co',anonKey:'public',session:const _Session(null),client:MockClient((_)async=>http.Response('{}',200)));
    expect(g.fetch(),throwsA(isA<StateError>()));
  });
  test('uses user bearer token and decodes account snapshot',()async{
    final client=MockClient((r)async{
      expect(r.headers['authorization'],'Bearer user-token');
      expect(r.headers['apikey'],'public-anon');
      expect(r.url.path,endsWith('/rest/v1/rpc/get_my_app_data'));
      return http.Response('{"profile":{"months":7},"favoriteProductIds":["p1"],"priceAlerts":[{"productId":"p1","targetPrice":12000}]}',200);
    });
    final g=SupabaseAccountGateway(baseUrl:'https://example.supabase.co/',anonKey:'public-anon',session:const _Session('user-token'),client:client);
    final data=await g.fetch();
    expect(data.favoriteProductIds,{'p1'});
    expect(data.profile?['months'],7);
    expect(data.priceAlerts['p1'],12000);
  });
}
