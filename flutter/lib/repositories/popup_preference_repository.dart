import 'package:shared_preferences/shared_preferences.dart';
import '../models/commercial_content.dart';

class PopupPreferenceRepository {
  Future<bool> isDismissed(ManagedPopup popup) async {
    final p=await SharedPreferences.getInstance();
    final key=_key(popup);
    return key==null?false:p.getBool(key)??false;
  }
  Future<void> dismiss(ManagedPopup popup) async {
    final p=await SharedPreferences.getInstance();
    final key=_key(popup);
    if(key!=null)await p.setBool(key,true);
  }
  String? _key(ManagedPopup p){
    if(p.dismissPolicy=='none')return null;
    if(p.dismissPolicy=='daily'){
      final d=DateTime.now();
      return 'popup_daily_${p.id}_${d.year}-${d.month}-${d.day}';
    }
    // SharedPreferences persists across restarts; session is conservatively treated
    // as one dismissal until a later session-store implementation is added.
    return 'popup_${p.dismissPolicy}_${p.id}';
  }
}
