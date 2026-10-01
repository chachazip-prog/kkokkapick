import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';
import 'package:kkokkapick/release_app_v10.dart';
import 'package:kkokkapick/release_app_v9.dart' show V9FavoritesPage, V9Sort;
import 'package:kkokkapick/theme/kkokkapick_theme.dart';

const _product = CatalogProduct(
  id: 'search-release-widths',
  name: '[에뜨와] 긴 상품명에서도 검색과 찜 화면을 유지하는 레니아 바디수트 세트',
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
  testWidgets('Search survives release widths at 200% text', (tester) async {
    for (final width in [320.0, 360.0, 390.0, 430.0]) {
      await tester.binding.setSurfaceSize(Size(width, 844));
      final controller = TextEditingController();
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
            body: V10SearchPage(
              controller: controller,
              categories: const ['전체', '바디수트', '상의', '하의'],
              category: '전체',
              sort: V9Sort.recommended,
              products: const [_product],
              favorites: const {'search-release-widths'},
              alerts: const {},
              onChanged: _noop,
              onCategory: _noopString,
              onSort: _noopSort,
              onFavorite: _noopProduct,
              onAlert: _noopProduct,
              onProduct: _noopProduct,
            ),
          ),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull,
          reason: 'Search overflowed at width $width and 200% text');
      expect(find.text('검색'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('총 1개'), findsOneWidget);
      expect(find.text('추천순'), findsOneWidget);
      expect(find.text('전체'), findsOneWidget);
      expect(find.textContaining('레니아 바디수트 세트'), findsOneWidget);

      controller.dispose();
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump();
    }
    await tester.binding.setSurfaceSize(null);
  });

  testWidgets('Favorites populated and empty states survive release widths at 200% text',
      (tester) async {
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
          home: const Scaffold(
            body: V9FavoritesPage(
              products: [_product],
              favorites: {'search-release-widths'},
              alerts: {},
              onFavorite: _noopProduct,
              onAlert: _noopProduct,
              onProduct: _noopProduct,
              onExplore: _noop,
            ),
          ),
        ),
      );
      await tester.pump();
      expect(tester.takeException(), isNull,
          reason: 'Favorites populated state overflowed at width $width and 200% text');
      expect(find.text('찜한 상품'), findsOneWidget);
      expect(find.textContaining('레니아 바디수트 세트'), findsOneWidget);

      await tester.pumpWidget(
        MaterialApp(
          theme: KkokkapickTheme.light(),
          builder: (context, child) => MediaQuery(
            data: MediaQuery.of(context).copyWith(
              textScaler: const TextScaler.linear(2),
            ),
            child: child!,
          ),
          home: const Scaffold(
            body: V9FavoritesPage(
              products: [],
              favorites: {},
              alerts: {},
              onFavorite: _noopProduct,
              onAlert: _noopProduct,
              onProduct: _noopProduct,
              onExplore: _noop,
            ),
          ),
        ),
      );
      await tester.pump();
      expect(tester.takeException(), isNull,
          reason: 'Favorites empty state overflowed at width $width and 200% text');
      expect(find.text('아직 찜한 상품이 없어요'), findsOneWidget);
      expect(find.text('상품 둘러보기'), findsOneWidget);
    }
    await tester.binding.setSurfaceSize(null);
  });
}

void _noop() {}
void _noopString(String _) {}
void _noopSort(V9Sort _) {}
void _noopProduct(CatalogProduct _) {}
