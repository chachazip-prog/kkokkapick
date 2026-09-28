import 'dart:convert';
import 'package:http/http.dart' as http;

class CommercialAttributionRepository {
  const CommercialAttributionRepository({required this.supabaseUrl,required this.anonKey});
  final String supabaseUrl,anonKey;
  bool get enabled=>supabaseUrl.isNotEmpty&&anonKey.isNotEmpty;

  Future<void> impression({required String campaignId,String? productId,String? sessionKey})=>
    _record(campaignId:campaignId,productId:productId,type:'impression',sessionKey:sessionKey);
  Future<void> click({required String campaignId,String? productId,String? sessionKey})=>
    _record(campaignId:campaignId,productId:productId,type:'click',sessionKey:sessionKey);

  Future<void> _record({required String campaignId,String? productId,required String type,String? sessionKey}) async {
    if(!enabled)return;
    await http.post(Uri.parse('$supabaseUrl/rest/v1/rpc/record_commercial_event'),
      headers:{'apikey':anonKey,'Authorization':'Bearer $anonKey','Content-Type':'application/json'},
      body:jsonEncode({'p_campaign_id':campaignId,'p_product_id':productId,'p_event_type':type,'p_session_key':sessionKey}));
  }
}
