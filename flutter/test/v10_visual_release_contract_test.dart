import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';
import 'package:kkokkapick/release_app_v10.dart';
import 'package:kkokkapick/services/home_feed_ranking.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';
import 'package:kkokkapick/widgets/brand_identity.dart';
import 'package:kkokkapick/widgets/v9_commerce.dart';

CatalogProduct _product(int index, {bool rich = false}) => CatalogProduct(
      id: 'p$index',
      name: rich
          ? '[롯데백화점] [에뜨와] 레니아 바디수트 세트'
          : '데일리 베이비 상품 $index',
      brand: rich ? '에뜨와' : '테스트브랜드',
      category: rich ? '바디수트' : '상의',
      stage: rich ? '신생아' : '베이비',
      imageUrl: rich ? 'https://cdn.example.com/a.jpg' : null,
      imageUrls: rich
          ? const [
              'https://cdn.example.com/a.jpg',
              'https://cdn.example.com/b.jpg',
            ]
          : const [],
      minPrice: 32000 + index,
      maxPrice: rich ? 35000 : 32000 + index,
      offerCount: rich ? 2 : 1,
      fitStatus: rich ? 'verified' : 'unverified',
      offers: rich
          ? const [
              ProductOffer(
                merchant: '판매처A',
                price: 32000,
                originalPrice: 39000,
                affiliateUrl: 'https://example.com/a',
              ),
              ProductOffer(
                merchant: '판매처B',
                price: 35000,
                affiliateUrl: 'https://example.com/b',
              ),
            ]
          : const [
              ProductOffer(
                merchant: '판매처',
                price: 32000,
                affiliateUrl: 'https://example.com/product',
              ),
            ],
      availableSizes: rich ? const ['70', '80', '90'] : const [],
      sizeGuide: null,
      specs: rich
          ? const ProductSpecs(
              material: '면 100%',
              season: '봄·가을',
              thickness: '보통',
              colorCount: 3,
            )
          : const ProductSpecs(),
      reviews: rich
          ? const [
              ProductReviewSummary(
                source: '판매처A',
                count: 120,
                rating: 4.8,
              ),
            ]
          : const [],
    );

void main() {
  testWidgets('approved wordmark keeps black type and warm accent', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: KkokkapickTheme.light(),
        home: const Scaffold(body: Center(child: KkokkapickBrandMark())),
      ),
    );

    final wordmark = tester.widget<Text>(find.text('꼬까픽'));
    expect(wordmark.style?.fontWeight, FontWeight.w900);
    expect(wordmark.style?.color, const Color(0xFF17171B));

    final accent = tester.widget<Icon>(find.byIcon(Icons.favorite_rounded));
    expect(accent.color, const Color(0xFFFF8FA3));
  });

  testWidgets('product card exposes bounded surface and gallery affordance only for multi-image data', (tester) async {
    final product = _product(0, rich: true);
    await tester.pumpWidget(
      MaterialApp(
        theme: KkokkapickTheme.light(),
        home: Scaffold(
          body: Center(
            child: SizedBox(
              width: 190,
              height: 390,
              child: V9ProductCard(
                product: product,
                favorite: false,
                alertEnabled: false,
                onFavorite: () {},
                onAlert: () {},
                onTap: () {},
              ),
            ),
          ),
        ),
      ),
    );
    await tester.pump();

    expect(tester.takeException(), isNull);
    final cardMaterial = tester
        .widgetList<Material>(find.byType(Material))
        .firstWhere((material) => material.elevation == .35);
    final shape = cardMaterial.shape! as RoundedRectangleBorder;
    expect(shape.side.width, 1);
    expect(shape.side.color, const Color(0xFFE9E7EC));
    expect(find.byType(PageView), findsOneWidget);
    expect(find.text('1/2'), findsOneWidget);
    expect(find.text('[에뜨와] 레니아 바디수트 세트'), findsOneWidget);

    await tester.pumpWidget(
      MaterialApp(
        theme: KkokkapickTheme.light(),
        home: Scaffold(
          body: Center(
            child: SizedBox(
              width: 190,
              height: 390,
              child: V9ProductCard(
                product: _product(1),
                favorite: false,
                alertEnabled: false,
                onFavorite: () {},
                onAlert: () {},
                onTap: () {},
              ),
            ),
          ),
        ),
      ),
    );
    await tester.pump();
    expect(tester.takeException(), isNull);
    expect(find.byType(PageView), findsNothing);
    expect(find.textContaining('/'), findsNothing);
  });

  testWidgets('product detail exposes release information before merchant handoff', (tester) async {
    final product = _product(0, rich: true);
    await tester.binding.setSurfaceSize(const Size(390, 844));
    await tester.pumpWidget(
      MaterialApp(
        theme: KkokkapickTheme.light(),
        home: Scaffold(
          body: V10ProductDetailSheet(
            product: product,
            favorite: false,
            alertEnabled: false,
            onFavorite: () {},
            onAlert: () {},
          ),
        ),
      ),
    );
    await tester.pump();

    expect(find.byType(PageView), findsOneWidget);
    expect(find.text('1/2'), findsOneWidget);
    expect(find.text('에뜨와'), findsOneWidget);
    expect(find.text('[에뜨와] 레니아 바디수트 세트'), findsOneWidget);
    expect(find.text('최저가'), findsOneWidget);
    expect(find.text('32,000원'), findsWidgets);

    await tester.drag(find.byType(ListView), const Offset(0, -520));
    await tester.pumpAndSettle();
    for (final label in ['상품 정보', '사이즈', '소재', '시즌', '두께', '색상', '판매처']) {
      expect(find.text(label), findsOneWidget, reason: 'missing product detail field: $label');
    }
    expect(find.text('70–90'), findsOneWidget);
    expect(find.text('면 100%'), findsOneWidget);
    expect(find.text('봄·가을'), findsOneWidget);
    expect(find.text('보통'), findsOneWidget);
    expect(find.text('3개'), findsOneWidget);
    expect(find.text('2곳'), findsOneWidget);

    await tester.drag(find.byType(ListView), const Offset(0, -620));
    await tester.pumpAndSettle();
    expect(find.text('판매처별 리뷰'), findsOneWidget);
    expect(find.text('판매처A'), findsWidgets);
    expect(find.textContaining('4.8'), findsOneWidget);
    expect(find.text('가격 내려가면 알림받기'), findsOneWidget);
    expect(find.text('판매처 비교'), findsOneWidget);
    expect(find.text('판매처B'), findsOneWidget);

    await tester.binding.setSurfaceSize(null);
  });

  testWidgets('home composes editorial rail, product rail and continuous grid', (tester) async {
    final products = List.generate(12, (index) => _product(index));
    final feed = RankedHomeFeed(
      items: products,
      evidence: HomeFeedEvidence.discoveryFallback,
    );

    await tester.binding.setSurfaceSize(const Size(390, 844));
    await tester.pumpWidget(
      MaterialApp(
        theme: KkokkapickTheme.light(),
        home: Scaffold(
          body: V10HomePage(
            categories: const ['상의', '하의', '바디수트'],
            profile: null,
            personalized: feed,
            discovery: feed,
            favorites: const {},
            alerts: const {},
            onSearch: () {},
            onFavorites: () {},
            onAlerts: () {},
            onCategory: (_) {},
            onProfile: () {},
            onFavorite: (_) {},
            onAlert: (_) {},
            onProduct: (_) {},
          ),
        ),
      ),
    );
    await tester.pump();

    expect(tester.takeException(), isNull);
    expect(find.text('우리 아이를 위한 추천'), findsOneWidget);
    expect(find.text('지금 둘러볼 상품'), findsOneWidget);
    expect(find.byType(V9EditorialStrip), findsOneWidget);
    expect(find.byType(V10ProductRail), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('계속 둘러보세요'),
      420,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    expect(find.text('계속 둘러보세요'), findsOneWidget);
    expect(find.byType(V10ProductGrid), findsOneWidget);
    expect(tester.takeException(), isNull);

    await tester.binding.setSurfaceSize(null);
  });
}
