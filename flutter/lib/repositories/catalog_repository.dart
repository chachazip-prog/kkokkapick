import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/catalog_product.dart';

class CatalogRepository {
  CatalogRepository({http.Client? client}):_client=client??http.Client();
  final http.Client _client;

  Future<List<CatalogProduct>> fetchCatalog(Uri endpoint) async {
    final response=await _client.get(endpoint);
    if(response.statusCode<200||response.statusCode>=300) throw Exception('catalog_http_${response.statusCode}');
    final root=jsonDecode(response.body) as Map<String,dynamic>;
    final expiresAt=DateTime.tryParse(root['expiresAt']?.toString()??'');
    if(expiresAt!=null&&DateTime.now().toUtc().isAfter(expiresAt.toUtc())) throw Exception('catalog_expired');
    return (root['products'] as List? ?? const []).whereType<Map>().map((e)=>CatalogProduct.fromJson(Map<String,dynamic>.from(e))).toList();
  }
}
