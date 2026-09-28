import 'dart:convert';
import 'package:http/http.dart' as http;

class CommercialAttributionRepository {
  const CommercialAttributionRepository({required this.supabaseUrl,required this.anonKey});
  final String supabaseUrl,anonKey;
  bool get enabled=>supabaseUrl.isNotEmpty&&anonKey.isNotEmpty;
  Future<void> click({required String campaignId,String? productId}) async {
    if(!enabled)return;
    await http.post(Uri.parse('$supabaseUrl/rest/v1/commercial_events'),headers:{'apikey':anonKey,'Authorization':'Bearer $anonKey','Content-Type':'application/json'},body:jsonEncode({'campaign_id':campaignId,'product_id':productId,'event_type':'click'}));
  }
}
