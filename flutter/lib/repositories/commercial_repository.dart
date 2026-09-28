import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/commercial_content.dart';

class CommercialContent {
  const CommercialContent(this.campaigns,this.popups);
  final List<CommercialCampaign> campaigns;
  final List<ManagedPopup> popups;
}
class CommercialRepository {
  const CommercialRepository({required this.supabaseUrl,required this.anonKey});
  final String supabaseUrl,anonKey;
  bool get enabled=>supabaseUrl.isNotEmpty&&anonKey.isNotEmpty;
  Future<CommercialContent> fetchHome() async {
    if(!enabled)return const CommercialContent([],[]);
    final headers={'apikey':anonKey,'Authorization':'Bearer $anonKey'};
    final rs=await Future.wait([
      http.get(Uri.parse('$supabaseUrl/rest/v1/published_commercial_campaigns?select=*&placement=eq.home&order=priority.desc'),headers:headers),
      http.get(Uri.parse('$supabaseUrl/rest/v1/published_popups?select=*&or=(surface.eq.all,surface.eq.app)&placement=eq.home&order=priority.desc'),headers:headers)
    ]);
    if(rs.any((r)=>r.statusCode<200||r.statusCode>=300))return const CommercialContent([],[]);
    return CommercialContent(
      (jsonDecode(rs[0].body) as List).map((e)=>CommercialCampaign.fromJson(e)).toList(),
      (jsonDecode(rs[1].body) as List).map((e)=>ManagedPopup.fromJson(e)).toList());
  }
}
