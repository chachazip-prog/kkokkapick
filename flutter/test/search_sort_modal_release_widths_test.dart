import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';
import 'package:kkokkapick/release_app_v10.dart';
import 'package:kkokkapick/release_app_v9.dart' show V9Sort;
import 'package:kkokkapick/theme/kkokkapick_theme.dart';

void main() {
  testWidgets('Search sort modal survives release widths at 200% text', (tester) async {
    for (final width in [320.0, 360.0, 390.0, 430.0]) {
      await tester.binding.setSurfaceSize(Size(width, 844));
      final controller = TextEditingController();
      V9Sort? selected;

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
              categories: const ['전체', '바디수트'],
              category: '전체',
              sort: V9Sort.recommended,
              products: const <CatalogProduct>[],
              favorites: const {},
              alerts: const {},
              onChanged: _noop,
              onCategory: _noopString,
              onSort: (value) => selected = value,
              onFavorite: _noopProduct,
              onAlert: _noopProduct,
              onProduct: _noopProduct,
            ),
          ),
        ),
      );
      await tester.pump();
      expect(tester.takeException(), isNull,
          reason: 'Search base state overflowed at width $width and 200% text');

      await tester.tap(find.text('추천순'));
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull,
          reason: 'Sort modal overflowed at width $width and 200% text');
      expect(find.text('추천순'), findsWidgets);
      expect(find.text('낮은 가격순'), findsOneWidget);
      expect(find.text('높은 가격순'), findsOneWidget);
      expect(find.byIcon(Icons.radio_button_checked), findsOneWidget);
      expect(find.byIcon(Icons.radio_button_off), findsNWidgets(2));

      await tester.tap(find.text('낮은 가격순'));
      await tester.pumpAndSettle();
      expect(selected, V9Sort.low,
          reason: 'Sort selection did not propagate at width $width');
      expect(tester.takeException(), isNull);

      controller.dispose();
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump();
    }
    await tester.binding.setSurfaceSize(null);
  });
}

void _noop() {}
void _noopString(String _) {}
void _noopProduct(CatalogProduct _) {}
