import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';
import 'package:kkokkapick/release_app_v10.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';

const _product = CatalogProduct(
  id: 'category-release-widths',
  name: '[에뜨와] 아주 긴 상품명에서도 카테고리 화면이 무너지지 않는 레니아 바디수트 세트',
  brand: '에뜨와',
  category: '바디수트',
  stage: '신생아',
  imageUrl: 'https://cdn.example.com/a.jpg',
  imageUrls: ['https://cdn.example.com/a.jpg'],
  minPrice: 32000,
  maxPrice: 32000,
  offerCount: 1,
  fitStatus: 'verified',
  offers: [
    ProductOffer(
      merchant: '판매처A',
      price: 32000,
      affiliateUrl: 'https://example.com/a',
    ),
  ],
  availableSizes: ['70', '80', '90'],
  sizeGuide: null,
  specs: ProductSpecs(material: '면 100%'),
  reviews: [],
);

void main() {
  testWidgets('Category populated state survives release widths at 200% text', (tester) async {
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
          home: const V10CategoryPage(
            title: '바디수트',
            products: [_product],
            favorites: {'category-release-widths'},
            alerts: {'category-release-widths'},
            onFavorite: _noopProduct,
            onAlert: _noopProduct,
            onProduct: _noopProduct,
          ),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull,
          reason: 'Category populated state overflowed at width $width and 200% text');
      expect(find.text('바디수트'), findsOneWidget);
      expect(find.text('1개 상품'), findsOneWidget);
      expect(find.textContaining('레니아 바디수트 세트'), findsOneWidget);
      expect(find.byIcon(Icons.favorite_rounded), findsOneWidget);
      expect(find.byIcon(Icons.notifications_active_rounded), findsOneWidget);

      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump();
    }
    await tester.binding.setSurfaceSize(null);
  });

  testWidgets('Category empty state keeps a recovery action at release widths and 200% text', (tester) async {
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
          home: const V10CategoryPage(
            title: '원피스',
            products: [],
            favorites: {},
            alerts: {},
            onFavorite: _noopProduct,
            onAlert: _noopProduct,
            onProduct: _noopProduct,
          ),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull,
          reason: 'Category empty state overflowed at width $width and 200% text');
      expect(find.text('원피스'), findsOneWidget);
      expect(find.text('0개 상품'), findsOneWidget);
      expect(find.text('이 카테고리에는 아직 상품이 없어요'), findsOneWidget);
      expect(find.text('다른 카테고리 보기'), findsOneWidget);

      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump();
    }
    await tester.binding.setSurfaceSize(null);
  });
}

void _noopProduct(CatalogProduct _) {}
