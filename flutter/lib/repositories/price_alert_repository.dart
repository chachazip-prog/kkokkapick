import 'package:shared_preferences/shared_preferences.dart';

class PriceAlertRepository {
  static String _key(String id)=>'price_alert_$id';
  Future<int?> get(String id) async=>(await SharedPreferences.getInstance()).getInt(_key(id));
  Future<void> set(String id,int? price) async {
    final p=await SharedPreferences.getInstance();
    if(price!=null&&price>0){await p.setInt(_key(id),price);}else{await p.remove(_key(id));}
  }
}
