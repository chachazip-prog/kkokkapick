import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';
import 'package:kkokkapick/repositories/child_profile_repository.dart';
import 'package:kkokkapick/services/kkokkafit_engine.dart';

void main(){
  final engine=KkokkafitEngine();
  test('requires profile',(){
    final p=CatalogProduct.fromJson({'id':'1','name':'x','brand':'아가방','category':'상의','fitStatus':'verified','offers':[]});
    expect(engine.evaluate(null,p).status,'profile_required');
  });
  test('recommends only verified chart brand',(){
    final p=CatalogProduct.fromJson({'id':'1','name':'x','brand':'에뜨와','category':'바디수트','fitStatus':'verified','offers':[]});
    final r=engine.evaluate(const ChildProfile(months:10,heightCm:74,weightKg:9),p);
    expect(r.status,'recommended');expect(r.label,'80 우선 확인');
  });
  test('does not infer unknown brand',(){
    final p=CatalogProduct.fromJson({'id':'1','name':'90 사이즈 상품','category':'상의','fitStatus':'unverified','offers':[]});
    expect(engine.evaluate(const ChildProfile(months:10,heightCm:74,weightKg:9),p).status,'insufficient_product_data');
  });
}
