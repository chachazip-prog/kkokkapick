import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';
import 'package:kkokkapick/repositories/child_profile_repository.dart';
import 'package:kkokkapick/services/home_feed_ranking.dart';

CatalogProduct product(
  String id, {
  String category = '아우터',
  String brand = '브랜드A',
  String? stage = '베이비',
  String? imageUrl = 'https://example.com/image.jpg',
  int? minPrice = 30000,
  int offerCount = 1,
  bool discounted = false,
}) {
  return CatalogProduct(
    id: id,
    name: '$brand $id',
    category: category,
    fitStatus: 'unverified',
    offers: [
      ProductOffer(
        merchant: '판매처',
        price: minPrice,
        originalPrice: discounted && minPrice != null ? minPrice + 10000 : null,
        affiliateUrl: 'https://example.com/buy/$id',
      ),
    ],
    offerCount: offerCount,
    availableSizes: const [],
    brand: brand,
    stage: stage,
    imageUrl: imageUrl,
    minPrice: minPrice,
    maxPrice: minPrice,
  );
}

void main() {
  const service = HomeFeedRankingService();

  test('no user or behavioral signals uses automatic discovery fallback', () {
    final complete = product('complete', offerCount: 2, discounted: true);
    final incomplete = product('incomplete', imageUrl: null, minPrice: null);

    final result = service.rankPersonalized([incomplete, complete], const HomeFeedSignals());

    expect(result.evidence, HomeFeedEvidence.discoveryFallback);
    expect(result.supportsPopularityClaim, isFalse);
    expect(result.items.first.id, 'complete');
  });

  test('behavioral snapshot enables a truthful trending evidence state', () {
    final a = product('a');
    final b = product('b');

    final result = service.rankTrending(
      [a, b],
      engagementScores: const {'b': 80},
    );

    expect(result.evidence, HomeFeedEvidence.behavioralTrending);
    expect(result.supportsPopularityClaim, isTrue);
    expect(result.items.first.id, 'b');
  });

  test('personalized ranking uses child stage and favorite affinity', () {
    final saved = product('saved', brand: '포근', category: '아우터');
    final related = product('related', brand: '포근', category: '아우터');
    final unrelated = product(
      'unrelated',
      brand: '다른브랜드',
      category: '신발',
      stage: '토들러',
    );

    final result = service.rankPersonalized(
      [unrelated, saved, related],
      const HomeFeedSignals(
        profile: ChildProfile(months: 8, heightCm: 70, weightKg: 8),
        favoriteProductIds: {'saved'},
      ),
    );

    expect(result.evidence, HomeFeedEvidence.personalized);
    expect(result.items.first.id, 'related');
    expect(result.items.indexWhere((p) => p.id == 'related'),
        lessThan(result.items.indexWhere((p) => p.id == 'unrelated')));
  });

  test('fixed inputs produce deterministic stable ordering', () {
    final a = product('a');
    final b = product('b');
    final c = product('c');

    final first = service.rankTrending([c, b, a]).items.map((p) => p.id).toList();
    final second = service.rankTrending([b, a, c]).items.map((p) => p.id).toList();

    expect(first, second);
    expect(first, ['a', 'b', 'c']);
  });
}
