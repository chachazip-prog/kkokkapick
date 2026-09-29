import 'dart:convert';
import 'package:http/http.dart' as http;
import 'account_sync.dart';

final class SupabaseAccountGateway implements AccountSyncGateway {
  SupabaseAccountGateway({
    required this.baseUrl,
    required this.anonKey,
    required this.session,
    http.Client? client,
  }):_client=client??http.Client();

  final String baseUrl,anonKey;
  final AuthSession session;
  final http.Client _client;

  Map<String,String> get _headers {
    if(baseUrl.trim().isEmpty||anonKey.trim().isEmpty) {
      throw StateError('Supabase public configuration required');
    }
    final token=session.accessToken;
    if(!session.isAuthenticated||token==null||token.isEmpty) {
      throw StateError('Authenticated session required');
    }
    return {'apikey':anonKey,'Authorization':'Bearer $token','Content-Type':'application/json'};
  }

  Uri _rpc(String name)=>Uri.parse('${baseUrl.replaceFirst(RegExp(r'/+$'),'')}/rest/v1/rpc/$name');

  @override Future<AccountSyncSnapshot> fetch() async {
    final r=await _client.post(_rpc('get_my_app_data'),headers:_headers,body:'{}');
    return _decode(r);
  }

  @override Future<AccountSyncSnapshot> syncLocal(AccountSyncSnapshot local) async {
    final alerts=local.priceAlerts.entries.map((e)=>{'product_id':e.key,'target_price':e.value}).toList();
    final r=await _client.post(_rpc('sync_my_app_data'),headers:_headers,body:jsonEncode({
      'p_favorite_product_ids':local.favoriteProductIds.toList(),
      'p_profile':local.profile,
      'p_price_alerts':alerts,
    }));
    return _decode(r);
  }

  Future<void> setFavorite(String productId,bool favorite) async {
    final r=await _client.post(_rpc('set_my_favorite'),headers:_headers,body:jsonEncode({'p_product_id':productId,'p_favorite':favorite}));
    _requireSuccess(r);
  }

  Future<void> setPriceAlert(String productId,int? targetPrice) async {
    final r=await _client.post(_rpc('set_my_price_alert'),headers:_headers,body:jsonEncode({'p_product_id':productId,'p_target_price':targetPrice}));
    _requireSuccess(r);
  }

  Future<void> setChildProfile(Map<String,Object?>? profile) async {
    final r=await _client.post(_rpc('set_my_child_profile'),headers:_headers,body:jsonEncode({'p_profile':profile}));
    _requireSuccess(r);
  }

  Future<void> deleteAccountIdentity() async {
    final r=await _client.post(_rpc('delete_my_account'),headers:_headers,body:'{}');
    _requireSuccess(r);
  }

  @override Future<void> deleteAppData() async {
    final r=await _client.post(_rpc('delete_my_app_data'),headers:_headers,body:'{}');
    _requireSuccess(r);
  }

  AccountSyncSnapshot _decode(http.Response r) {
    _requireSuccess(r);
    dynamic raw;
    try { raw=jsonDecode(r.body); } on FormatException { throw const AccountPayloadException(); }
    final data=raw is List&&raw.length==1?raw.first:raw;
    if(data is! Map)throw const AccountPayloadException();
    final m=Map<String,dynamic>.from(data);
    final ids=(m['favoriteProductIds'] as List? ?? const []).whereType<String>().toSet();
    final profile=m['profile'] is Map?Map<String,Object?>.from(m['profile'] as Map):null;
    final alerts=<String,int>{};
    for(final item in (m['priceAlerts'] as List? ?? const [])){
      if(item is Map){
        final id=item['productId']??item['product_id'], price=item['targetPrice']??item['target_price'];
        if(id is String&&price is num&&price>0)alerts[id]=price.toInt();
      }
    }
    return AccountSyncSnapshot(favoriteProductIds:ids,profile:profile,priceAlerts:alerts);
  }

  void _requireSuccess(http.Response r){
    if(r.statusCode<200||r.statusCode>=300)throw AccountGatewayException(r.statusCode);
  }
}

final class AccountPayloadException implements Exception {
  const AccountPayloadException();
  @override String toString()=> 'AccountPayloadException(invalid server payload)';
}

final class AccountGatewayException implements Exception {
  const AccountGatewayException(this.statusCode);
  final int statusCode;
  @override String toString()=>'AccountGatewayException(statusCode: $statusCode)';
}
