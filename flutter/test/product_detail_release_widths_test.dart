import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';
import 'package:kkokkapick/release_app_v10.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';

const _product = CatalogProduct(
  id: 'detail-release-widths',
  name: '[롯데백화점] [에뜨와] 긴 상품명에서도 정보 계층을 유지하는 레니아 바디수트 세트',
  brand: '에뜨와',
  category: '바디수트',
  stage: '신생아',
  imageUrl: 'https://cdn.example.com/a.jpg',
  imageUrls: [
    'https://cdn.example.com/a.jpg',
    'https://cdn.example.com/b.jpg',
  ],
  minPrice: 32000,
  maxPrice: 35000,
  offerCount: 2,
  fitStatus: 'verified',
  offers: [
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
  ],
  availableSizes: ['70', '80', '90'],
  sizeGuide: null,
  specs: ProductSpecs(
    material: '면 100%',
    season: '봄·가을',
    thickness: '보통',
    colorCount: 3,
  ),
  reviews: [
    ProductReviewSummary(source: '판매처A', count: 120, rating: 4.8),
  ],
);

void main() {
  testWidgets('rich product detail survives release widths at 200% text',
      (tester) async {
    for (final width in [320.0, 360.0, 390.0, 430.0]) {
      // Reset the widget tree between widths so the ListView/PageView state from
      // the previous viewport cannot leak its scroll position into the next one.
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump();
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
            body: V10ProductDetailSheet(
              product: _product,
              favorite: false,
              alertEnabled: false,
              onFavorite: _noop,
              onAlert: _noop,
            ),
          ),
        ),
      );
      await tester.pump();

      expect(
        tester.takeException(),
        isNull,
        reason: 'detail top overflowed at width $width and 200% text',
      );
      expect(find.byType(PageView), findsOneWidget);
      expect(find.text('1/2'), findsOneWidget);
      expect(find.text('최저가'), findsOneWidget);
      expect(find.text('32,000원'), findsWidgets);

      final list = find.byType(ListView);
      expect(list, findsOneWidget);

      for (final label in ['상품 정보', '사이즈', '소재', '시즌', '두께', '색상', '판매처']) {
        await _scrollForwardUntilVisible(tester, list, find.text(label));
        expect(find.text(label), findsOneWidget, reason: 'missing $label at $width');
        expect(
          tester.takeException(),
          isNull,
          reason: 'detail specs overflowed at $label / width $width and 200% text',
        );
      }

      for (final label in ['판매처별 리뷰', '가격 내려가면 알림받기', '판매처 비교', '판매처B']) {
        await _scrollForwardUntilVisible(tester, list, find.text(label));
        expect(find.text(label), findsOneWidget, reason: 'missing $label at $width');
        expect(
          tester.takeException(),
          isNull,
          reason: 'detail actions overflowed at $label / width $width and 200% text',
        );
      }
    }

    await tester.binding.setSurfaceSize(null);
  });
}

Future<void> _scrollForwardUntilVisible(
  WidgetTester tester,
  Finder scrollable,
  Finder target,
) async {
  for (var attempt = 0; attempt < 14 && target.evaluate().isEmpty; attempt++) {
    await tester.drag(scrollable, const Offset(0, -240));
    await tester.pumpAndSettle();
  }
}

void _noop() {}
