import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/commercial_content.dart';
import 'package:kkokkapick/repositories/popup_preference_repository.dart';
void main(){
 test('session dismissal lasts for repository session',() async {
  final r=PopupPreferenceRepository();
  const p=ManagedPopup(id:'p1',title:'x',dismissPolicy:'session');
  expect(await r.isDismissed(p),false);
  await r.dismiss(p);
  expect(await r.isDismissed(p),true);
 });
 test('none policy never dismisses',() async {
  final r=PopupPreferenceRepository();
  const p=ManagedPopup(id:'p2',title:'x',dismissPolicy:'none');
  await r.dismiss(p);
  expect(await r.isDismissed(p),false);
 });
}
