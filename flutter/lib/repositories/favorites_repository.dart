import 'package:shared_preferences/shared_preferences.dart';

class FavoritesRepository {
  static const _key='favorite_product_ids';

  Future<Set<String>> load() async {
    final prefs=await SharedPreferences.getInstance();
    return (prefs.getStringList(_key)??const <String>[]).toSet();
  }

  Future<void> save(Set<String> ids) async {
    final prefs=await SharedPreferences.getInstance();
    await prefs.setStringList(_key,ids.toList()..sort());
  }
  Future<void> clear() async=>(await SharedPreferences.getInstance()).remove(_key);
}
