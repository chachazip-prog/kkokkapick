import 'dart:math' as math;

import '../models/catalog_product.dart';
import '../repositories/child_profile_repository.dart';

enum HomeFeedEvidence {
  personalized,
  behavioralTrending,
  discoveryFallback,
}

final class RankedHomeFeed {
  const RankedHomeFeed({required this.items, required this.evidence});

  final List<CatalogProduct> items;
  final HomeFeedEvidence evidence;

  bool get supportsPopularityClaim =>
      evidence == HomeFeedEvidence.behavioralTrending;
}

final class HomeFeedSignals {
  const HomeFeedSignals({
    this.profile,
    this.favoriteProductIds = const {},
    this.priceAlertProductIds = const {},
    this.recentProductIds = const [],
  });

  final ChildProfile? profile;
  final Set<String> favoriteProductIds;
  final Set<String> priceAlertProductIds;
  final List<String> recentProductIds;

  bool get hasPersonalizationSignal =>
      profile != null ||
      favoriteProductIds.isNotEmpty ||
      priceAlertProductIds.isNotEmpty ||
      recentProductIds.isNotEmpty;
}

/// Low-operations home-feed ranking.
///
/// V1 is deterministic and works entirely from catalog + existing account
/// signals. [engagementScores] is an optional product-level aggregate snapshot.
/// A caller must also assert [behavioralEvidenceQualified] after checking the
/// backend snapshot's minimum sample/freshness policy before the result may
/// support a popularity/trending claim.
final class HomeFeedRankingService {
  const HomeFeedRankingService();

  RankedHomeFeed rankTrending(
    List<CatalogProduct> products, {
    Map<String, double> engagementScores = const {},
    bool behavioralEvidenceQualified = false,
    int limit = 12,
  }) {
    final hasBehavioralEvidence = behavioralEvidenceQualified &&
        engagementScores.values.any((v) => v > 0);
    final ranked = products
        .map((p) => _ScoredProduct(
              p,
              _qualityScore(p) + _engagementScore(p.id, engagementScores),
            ))
        .toList()
      ..sort(_compareScored);

    return RankedHomeFeed(
      items: _diversify(ranked, limit),
      evidence: hasBehavioralEvidence
          ? HomeFeedEvidence.behavioralTrending
          : HomeFeedEvidence.discoveryFallback,
    );
  }

  RankedHomeFeed rankPersonalized(
    List<CatalogProduct> products,
    HomeFeedSignals signals, {
    Map<String, double> engagementScores = const {},
    bool behavioralEvidenceQualified = false,
    int limit = 12,
  }) {
    if (!signals.hasPersonalizationSignal) {
      return rankTrending(
        products,
        engagementScores: engagementScores,
        behavioralEvidenceQualified: behavioralEvidenceQualified,
        limit: limit,
      );
    }

    final byId = {for (final product in products) product.id: product};
    final categoryAffinity = <String, double>{};
    final brandAffinity = <String, double>{};

    void absorb(Iterable<String> ids, double categoryWeight, double brandWeight) {
      for (final id in ids) {
        final product = byId[id];
        if (product == null) continue;
        categoryAffinity.update(
          product.category,
          (v) => v + categoryWeight,
          ifAbsent: () => categoryWeight,
        );
        final brand = product.brand?.trim();
        if (brand != null && brand.isNotEmpty) {
          brandAffinity.update(
            brand,
            (v) => v + brandWeight,
            ifAbsent: () => brandWeight,
          );
        }
      }
    }

    absorb(signals.favoriteProductIds, 1.8, 2.2);
    absorb(signals.priceAlertProductIds, 2.0, 2.4);
    absorb(signals.recentProductIds, 0.8, 1.0);

    final ranked = products.map((product) {
      var score = _qualityScore(product);

      final profile = signals.profile;
      if (profile != null &&
          product.stage != null &&
          product.stage!.trim().isNotEmpty &&
          product.stage!.trim().toLowerCase() == profile.stage.toLowerCase()) {
        score += 4.0;
      }

      score += (categoryAffinity[product.category] ?? 0) * 1.1;
      final brand = product.brand?.trim();
      if (brand != null && brand.isNotEmpty) {
        score += (brandAffinity[brand] ?? 0) * 1.3;
      }

      // Aggregate popularity can help break ties, but it must not overpower
      // explicit user/profile relevance in the personalized module.
      score += _engagementScore(product.id, engagementScores) * 0.25;

      // Discovery should not endlessly recycle things the user already saved.
      if (signals.favoriteProductIds.contains(product.id)) score -= 1.5;
      if (signals.priceAlertProductIds.contains(product.id)) score -= 0.75;
      if (signals.recentProductIds.contains(product.id)) score -= 0.5;

      return _ScoredProduct(product, score);
    }).toList()
      ..sort(_compareScored);

    return RankedHomeFeed(
      items: _diversify(ranked, limit),
      evidence: HomeFeedEvidence.personalized,
    );
  }

  static double _qualityScore(CatalogProduct product) {
    var score = 0.0;
    if (product.imageUrl?.trim().isNotEmpty == true) score += 2.0;
    if ((product.minPrice ?? 0) > 0) score += 1.5;
    if (product.brand?.trim().isNotEmpty == true) score += 0.4;
    score += math.min(product.offerCount, 3) * 0.35;
    if (product.fitStatus.toLowerCase() != 'unverified') score += 0.4;

    final hasDiscount = product.offers.any((offer) =>
        (offer.price ?? 0) > 0 &&
        (offer.originalPrice ?? 0) > (offer.price ?? 0));
    if (hasDiscount) score += 0.6;

    // Missing purchase-critical data is a strong negative signal.
    if (product.imageUrl?.trim().isNotEmpty != true) score -= 3.0;
    if ((product.minPrice ?? 0) <= 0) score -= 3.0;
    return score;
  }

  static double _engagementScore(
    String productId,
    Map<String, double> engagementScores,
  ) {
    final raw = math.max(0.0, engagementScores[productId] ?? 0.0);
    // Cap external aggregate influence so a malformed snapshot cannot make
    // low-quality catalog rows dominate indefinitely.
    return math.min(raw, 100.0) * 0.1;
  }

  static int _compareScored(_ScoredProduct a, _ScoredProduct b) {
    final scoreOrder = b.score.compareTo(a.score);
    if (scoreOrder != 0) return scoreOrder;
    return a.product.id.compareTo(b.product.id);
  }

  static List<CatalogProduct> _diversify(
    List<_ScoredProduct> ranked,
    int limit,
  ) {
    if (limit <= 0 || ranked.isEmpty) return const [];

    final brandCap = math.max(2, (limit + 2) ~/ 3);
    final categoryCap = math.max(2, (limit + 1) ~/ 2);
    final brandCounts = <String, int>{};
    final categoryCounts = <String, int>{};
    final selected = <CatalogProduct>[];
    final deferred = <CatalogProduct>[];

    for (final entry in ranked) {
      if (selected.length >= limit) break;
      final product = entry.product;
      final brand = product.brand?.trim() ?? '';
      final brandCount = brand.isEmpty ? 0 : (brandCounts[brand] ?? 0);
      final categoryCount = categoryCounts[product.category] ?? 0;

      if ((brand.isNotEmpty && brandCount >= brandCap) ||
          categoryCount >= categoryCap) {
        deferred.add(product);
        continue;
      }

      selected.add(product);
      if (brand.isNotEmpty) brandCounts[brand] = brandCount + 1;
      categoryCounts[product.category] = categoryCount + 1;
    }

    for (final product in deferred) {
      if (selected.length >= limit) break;
      selected.add(product);
    }

    return List.unmodifiable(selected);
  }
}

final class _ScoredProduct {
  const _ScoredProduct(this.product, this.score);
  final CatalogProduct product;
  final double score;
}
