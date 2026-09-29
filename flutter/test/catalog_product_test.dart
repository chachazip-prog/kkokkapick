import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';

void main(){
  test('parses canonical catalog product',(){
    final p=CatalogProduct.fromJson({
      'id':'p1','name':'바디수트','brand':'아가방','category':'바디수트','stage':'베이비','fitStatus':'verified','minPrice':12000,'maxPrice':15000,'offerCount':2,
      'offers':[{'merchant':'A','price':12000,'affiliateUrl':'https://example.com/a'},{'merchant':'B','price':15000,'affiliateUrl':'https://example.com/b'}]
    });
    expect(p.id,'p1');expect(p.offerCount,2);expect(p.offers.length,2);expect(p.merchant,'A');
  });
  test('display title strips merchant channel but preserves brand tag',(){
    final p=CatalogProduct.fromJson({'id':'p2','name':'[롯데백화점] [에뜨와] 벤자민 스트라이프 티셔츠','brand':'에뜨와','category':'상의','offers':[]});
    expect(p.displayName,'[에뜨와] 벤자민 스트라이프 티셔츠');
    final q=CatalogProduct.fromJson({'id':'p3','name':'[보리보리] 모이몰른 클라우드 레깅스','brand':'모이몰른','category':'하의','offers':[]});
    expect(q.displayName,'모이몰른 클라우드 레깅스');
  });
}

