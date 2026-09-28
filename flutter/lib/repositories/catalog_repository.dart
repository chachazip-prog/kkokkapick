import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/catalog_product.dart';

class CatalogRepository {
  CatalogRepository({http.Client? client}):_client=client??http.Client();
  final http.Client _client;

  Future<List<CatalogProduct>> fetchCatalog(Uri endpoint,{Map<String,String> headers=const {}}) async {
    final response=await _client.get(endpoint,headers:headers);
    if(response.statusCode<200||response.statusCode>=300) throw Exception('catalog_http_${response.statusCode}');
    final decoded=jsonDecode(response.body);
    final root=decoded is Map<String,dynamic>
        ? decoded
        : throw const FormatException('catalog_root');
    final expiresAt=DateTime.tryParse(root['expiresAt']?.toString()??'');
    if(expiresAt!=null&&DateTime.now().toUtc().isAfter(expiresAt.toUtc())) throw Exception('catalog_expired');
    return (root['products'] as List? ?? const []).whereType<Map>().map((e)=>CatalogProduct.fromJson(Map<String,dynamic>.from(e))).toList();
  }

  Future<List<CatalogProduct>> fetchSupabase({
    required String supabaseUrl,
    required String anonKey,
    int limit=200,
    int offset=0,
  }) async {
    if(supabaseUrl.isEmpty||anonKey.isEmpty)throw ArgumentError('supabase_config_required');
    final endpoint=Uri.parse('$supabaseUrl/rest/v1/rpc/get_published_catalog');
    final response=await _client.post(endpoint,headers:{
      'apikey':anonKey,
      'Authorization':'Bearer $anonKey',
      'Content-Type':'application/json',
    },body:jsonEncode({'p_limit':limit,'p_offset':offset}));
    if(response.statusCode<200||response.statusCode>=300)throw Exception('catalog_http_${response.statusCode}');
    final decoded=jsonDecode(response.body);
    final root=decoded is Map<String,dynamic>
        ? decoded
        : throw const FormatException('catalog_root');
    return (root['products'] as List? ?? const []).whereType<Map>().map((e)=>CatalogProduct.fromJson(Map<String,dynamic>.from(e))).toList();
  }
}
