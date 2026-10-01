import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';
import 'package:kkokkapick/release_app_v10.dart';
import 'package:kkokkapick/services/home_feed_ranking.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';
import 'package:kkokkapick/widgets/v9_commerce.dart';

CatalogProduct _product(int index) => CatalogProduct(
      id: 'home-$index',
      name: '[에뜨와] 홈 접근성 검증용 데일리 바디수트 상품 $index',
      brand: '에뜨와',
      category: index.isEven ? '바디수트' : '상의',
      stage: '베이비',
      imageUrl: 'https://cdn.example.com/$index.jpg',
      imageUrls: ['https://cdn.example.com/$index.jpg'],
      minPrice: 32000 + index,
      maxPrice: 32000 + index,
      offerCount: 1,
      fitStatus: 'verified',
      offers: [
        ProductOffer(
          merchant: '판매처A',
          price: 32000 + index,
          affiliateUrl: 'https://example.com/$index',
        ),
      ],
      availableSizes: const ['70', '80', '90'],
      sizeGuide: null,
      specs: const ProductSpecs(material: '면 100%'),
      reviews: const [],
    );

Widget _scaled({required double width, required Widget child}) => MaterialApp(
      theme: KkokkapickTheme.light(),
      builder: (context, built) => MediaQuery(
        data: MediaQuery.of(context).copyWith(
          textScaler: const TextScaler.linear(2),
        ),
        child: built!,
      ),
      home: child,
    );

const _destinations = [
  NavigationDestination(
    icon: Icon(Icons.home_outlined),
    selectedIcon: Icon(Icons.home_rounded),
    label: '홈',
  ),
  NavigationDestination(icon: Icon(Icons.search_rounded), label: '검색'),
  NavigationDestination(
    icon: Icon(Icons.favorite_border_rounded),
    selectedIcon: Icon(Icons.favorite_rounded),
    label: '찜',
  ),
  NavigationDestination(
    icon: Icon(Icons.person_outline_rounded),
    selectedIcon: Icon(Icons.person_rounded),
    label: '마이',
  ),
];

void main() {
  testWidgets('diagnostic: hero survives 320 at 200% text', (tester) async {
    await tester.binding.setSurfaceSize(const Size(320, 844));
    await tester.pumpWidget(
      _scaled(
        width: 320,
        child: Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(16),
            child: V9HeroBanner(product: _product(0), onTap: _noop),
          ),
        ),
      ),
    );
    await tester.pump();
    expect(tester.takeException(), isNull);
    await tester.binding.setSurfaceSize(null);
  });

  testWidgets('diagnostic: navigation bar survives 320 at 200% text', (tester) async {
    await tester.binding.setSurfaceSize(const Size(320, 844));
    await tester.pumpWidget(
      _scaled(
        width: 320,
        child: Scaffold(
          body: const SizedBox.expand(),
          bottomNavigationBar: NavigationBar(
            selectedIndex: 0,
            destinations: _destinations,
          ),
        ),
      ),
    );
    await tester.pump();
    expect(tester.takeException(), isNull);
    await tester.binding.setSurfaceSize(null);
  });

  testWidgets('diagnostic: product rail survives 320 at 200% text', (tester) async {
    final products = List.generate(8, _product);
    await tester.binding.setSurfaceSize(const Size(320, 844));
    await tester.pumpWidget(
      _scaled(
        width: 320,
        child: Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(16),
            child: V10ProductRail(
              products: products,
              favorites: const {},
              alerts: const {},
              onFavorite: _noopProduct,
              onAlert: _noopProduct,
              onProduct: _noopProduct,
            ),
          ),
        ),
      ),
    );
    await tester.pump();
    expect(tester.takeException(), isNull);
    await tester.binding.setSurfaceSize(null);
  });

  testWidgets('D03 Home survives release widths at 200% text', (tester) async {
    final products = List.generate(14, _product);
    final feed = RankedHomeFeed(
      items: products,
      evidence: HomeFeedEvidence.discoveryFallback,
    );

    for (final width in [320.0, 360.0, 390.0, 430.0]) {
      await tester.binding.setSurfaceSize(Size(width, 844));
      await tester.pumpWidget(
        MaterialApp(
          theme: KkokkapickTheme.light(),
          builder: (context, child) => MediaQuery(
            data: MediaQuery.of(context).copyWith(
              textScaler: const TextScaler.linear(2),
            ),
            child: child!,
          ),
          home: Scaffold(
            body: V10HomePage(
              categories: const ['바디수트', '상의', '하의', '원피스', '실내복'],
              profile: null,
              personalized: feed,
              discovery: feed,
              favorites: const {},
              alerts: const {},
              onSearch: _noop,
              onFavorites: _noop,
              onAlerts: _noop,
              onCategory: _noopString,
              onProfile: _noop,
              onFavorite: _noopProduct,
              onAlert: _noopProduct,
              onProduct: _noopProduct,
            ),
            bottomNavigationBar: NavigationBar(
              selectedIndex: 0,
              onDestinationSelected: (_) {},
              destinations: _destinations,
            ),
          ),
        ),
      );
      await tester.pump();

      expect(
        tester.takeException(),
        isNull,
        reason: 'Home top/nav overflowed at width $width and 200% text',
      );
      expect(find.text('꼬까픽'), findsOneWidget);
      expect(find.text('우리 아이를 위한 추천'), findsOneWidget);
      expect(find.text('지금 둘러볼 상품'), findsOneWidget);
      for (final label in ['홈', '검색', '찜', '마이']) {
        expect(find.text(label), findsOneWidget, reason: 'missing navigation label $label at $width');
      }

      final scrollable = find.byType(Scrollable).first;
      await tester.scrollUntilVisible(
        find.text('계속 둘러보세요'),
        360,
        scrollable: scrollable,
      );
      await tester.pumpAndSettle();
      expect(find.text('계속 둘러보세요'), findsOneWidget);
      expect(
        tester.takeException(),
        isNull,
        reason: 'Home feed overflowed at width $width and 200% text',
      );

      await tester.scrollUntilVisible(
        find.text('꼬까픽이 제안하는\n이번 주 스타일'),
        420,
        scrollable: scrollable,
      );
      await tester.pumpAndSettle();
      expect(find.text('꼬까픽이 제안하는\n이번 주 스타일'), findsOneWidget);
      expect(
        tester.takeException(),
        isNull,
        reason: 'Home editorial footer overflowed at width $width and 200% text',
      );

      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump();
    }

    await tester.binding.setSurfaceSize(null);
  });
}

void _noop() {}
void _noopString(String _) {}
void _noopProduct(CatalogProduct _) {}
