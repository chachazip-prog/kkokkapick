import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';

void main(){
  test('parses canonical catalog product',(){
    final p=CatalogProduct.fromJson({
      'id':'p1','name':'바디수트','brand':'아가방','category':'바디수트','stage':'베이비','fitStatus':'verified','minPrice':12000,'maxPrice':15000,'offerCount':2,
      'offers':[{'merchant':'A','price':12000,'affiliateUrl':'https://example.com/a'},{'merchant':'B','price':15000,'affiliateUrl':'https://example.com/b'}]
    });
    expect(p.id,'p1');expect(p.offerCount,2);expect(p.offers.length,2);expect(p.merchant,'A');expect(p.merchantCount,2);
  });

  test('display title strips merchant channel but preserves brand tag',(){
    final p=CatalogProduct.fromJson({'id':'p2','name':'[롯데백화점] [에뜨와] 벤자민 스트라이프 티셔츠','brand':'에뜨와','category':'상의','offers':[]});
    expect(p.displayName,'[에뜨와] 벤자민 스트라이프 티셔츠');
    final q=CatalogProduct.fromJson({'id':'p3','name':'[보리보리] 모이몰른 클라우드 레깅스','brand':'모이몰른','category':'하의','offers':[]});
    expect(q.displayName,'모이몰른 클라우드 레깅스');
  });

  test('parses multi-image specs size and rights-safe review metadata',(){
    final p=CatalogProduct.fromJson({
      'id':'p4','name':'코튼 원피스','brand':'에뜨와','category':'원피스','imageUrl':'https://example.com/1.jpg',
      'images':['https://example.com/1.jpg',{'url':'https://example.com/2.jpg'}],
      'availableSizes':['80','90','100'],
      'specs':{'material':'면 100%','season':'봄/가을','thickness':'보통','colorCount':3},
      'reviews':[{'source':'판매처 A','count':20,'rating':4.5,'url':'https://example.com/reviews-a'},{'source':'판매처 B','count':10,'rating':4.0}],
      'offers':[{'merchant':'판매처 A','price':30000,'affiliateUrl':'https://example.com/a'},{'merchant':'판매처 B','price':29000,'affiliateUrl':'https://example.com/b'}],
      'minPrice':29000,
    });
    expect(p.galleryUrls,['https://example.com/1.jpg','https://example.com/2.jpg']);
    expect(p.sizeRangeLabel,'80–100');
    expect(p.specs.material,'면 100%');
    expect(p.specs.colorCount,3);
    expect(p.totalReviewCount,30);
    expect(p.weightedRating,closeTo(4.3333,.001));
    expect(p.merchantCount,2);
  });

  test('unknown evidence stays absent instead of being synthesized',(){
    final p=CatalogProduct.fromJson({'id':'p5','name':'상품','category':'기타','offers':[]});
    expect(p.galleryUrls,isEmpty);
    expect(p.sizeRangeLabel,isNull);
    expect(p.specs.hasAny,isFalse);
    expect(p.reviews,isEmpty);
    expect(p.weightedRating,isNull);
  });
}
