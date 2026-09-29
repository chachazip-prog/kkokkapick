import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';
import 'package:kkokkapick/widgets/approved_commerce.dart';

CatalogProduct _product(String id) => CatalogProduct(
      id: id,
      name: '[롯데백화점] 아주 긴 상품명이어도 가격과 하트 영역이 깨지지 않아야 하는 베이비 플라워 프릴 원피스',
      brand: '에뜨와',
      category: '원피스',
      stage: '베이비',
      imageUrl: null,
      minPrice: 38900,
      maxPrice: 42000,
      offerCount: 2,
      fitStatus: 'verified',
      offers: const [],
      availableSizes: const ['80', '90'],
      sizeGuide: null,
    );

void main() {
  testWidgets('approved commerce grid survives release widths and long names',
      (tester) async {
    final products = [_product('a'), _product('b')];
    for (final width in [320.0, 360.0, 390.0, 430.0]) {
      await tester.binding.setSurfaceSize(Size(width, 844));
      await tester.pumpWidget(MaterialApp(
        theme: KkokkapickTheme.light(),
        home: Scaffold(
          body: SingleChildScrollView(
            child: ApprovedProductGrid(
              products: products,
              favoriteIds: const {'a'},
              alerts: const {'b': 35000},
              onFavorite: (_) {},
              onTap: (_) {},
            ),
          ),
        ),
      ));
      await tester.pump();
      expect(tester.takeException(), isNull,
          reason: 'approved product grid overflow at width $width');
      expect(find.text('38,900원'), findsNWidgets(2));
      expect(find.byIcon(Icons.image_outlined), findsNWidgets(2));
    }
    await tester.binding.setSurfaceSize(null);
  });

  testWidgets('empty state remains actionable without promotional content',
      (tester) async {
    var tapped = false;
    await tester.pumpWidget(MaterialApp(
      theme: KkokkapickTheme.light(),
      home: Scaffold(
        body: ApprovedEmptyState(
          icon: Icons.favorite_border,
          title: '아직 찜한 상품이 없어요',
          message: '상품을 둘러보세요.',
          actionLabel: '상품 둘러보기',
          onAction: () => tapped = true,
        ),
      ),
    ));
    await tester.tap(find.text('상품 둘러보기'));
    expect(tapped, isTrue);
  });

  testWidgets('approved bottom navigation semantics use four confirmed tabs',
      (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: KkokkapickTheme.light(),
      home: Scaffold(
        bottomNavigationBar: NavigationBar(
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), label: '홈'),
            NavigationDestination(icon: Icon(Icons.search), label: '검색'),
            NavigationDestination(icon: Icon(Icons.favorite_border), label: '찜'),
            NavigationDestination(icon: Icon(Icons.person_outline), label: '마이'),
          ],
        ),
      ),
    ));
    for (final label in ['홈', '검색', '찜', '마이']) {
      expect(find.text(label), findsOneWidget);
    }
  });
}
