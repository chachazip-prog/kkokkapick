import 'package:shared_preferences/shared_preferences.dart';
import '../models/commercial_content.dart';

class PopupPreferenceRepository {
  final Set<String> _sessionDismissed={};

  Future<bool> isDismissed(ManagedPopup popup) async {
    if(popup.dismissPolicy=='none')return false;
    if(popup.dismissPolicy=='session')return _sessionDismissed.contains(popup.id);
    final p=await SharedPreferences.getInstance();
    return p.getBool(_persistentKey(popup))??false;
  }

  Future<void> dismiss(ManagedPopup popup) async {
    if(popup.dismissPolicy=='none')return;
    if(popup.dismissPolicy=='session'){_sessionDismissed.add(popup.id);return;}
    final p=await SharedPreferences.getInstance();
    await p.setBool(_persistentKey(popup),true);
  }

  String _persistentKey(ManagedPopup p){
    if(p.dismissPolicy=='daily'){
      final d=DateTime.now();
      return 'popup_daily_${p.id}_${d.year}-${d.month}-${d.day}';
    }
    return 'popup_forever_${p.id}';
  }
}
