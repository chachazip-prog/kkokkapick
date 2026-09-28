import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/commercial_content.dart';
import 'package:kkokkapick/repositories/commercial_repository.dart';
void main(){
 test('commercial models parse public read model',(){
  final c=CommercialCampaign.fromJson({'id':'1','title':'기획전','disclosure_label':'Sponsored','partner_name':'브랜드','priority':3});
  expect(c.title,'기획전');expect(c.priority,3);expect(c.disclosureLabel,'Sponsored');
 });
 test('commercial repository is disabled without public config',(){
  const r=CommercialRepository(supabaseUrl:'',anonKey:'');
  expect(r.enabled,false);
 });
}
