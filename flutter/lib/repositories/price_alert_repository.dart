import 'package:shared_preferences/shared_preferences.dart';

class PriceAlertRepository {
  static const _indexKey='price_alert_product_ids';
  static String _key(String id)=>'price_alert_$id';
  Future<int?> get(String id) async=>(await SharedPreferences.getInstance()).getInt(_key(id));
  Future<void> set(String id,int? price) async {
    final p=await SharedPreferences.getInstance();
    final ids=(p.getStringList(_indexKey)??const <String>[]).toSet();
    if(price!=null&&price>0){await p.setInt(_key(id),price);ids.add(id);}else{await p.remove(_key(id));ids.remove(id);}
    await p.setStringList(_indexKey,ids.toList()..sort());
  }
  Future<Map<String,int>> loadAll() async {final p=await SharedPreferences.getInstance();final out=<String,int>{};for(final id in p.getStringList(_indexKey)??const <String>[]){final v=p.getInt(_key(id));if(v!=null&&v>0)out[id]=v;}return out;}
  Future<void> clear() async {final p=await SharedPreferences.getInstance();for(final id in p.getStringList(_indexKey)??const <String>[]){await p.remove(_key(id));}await p.remove(_indexKey);}
}
