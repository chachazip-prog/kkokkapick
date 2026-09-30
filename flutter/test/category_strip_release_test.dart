import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';
import 'package:kkokkapick/widgets/v9_commerce.dart';

void main() {
  testWidgets('category labels remain complete at release phone widths', (tester) async {
    const labels = ['바디수트', '신생아 바디수트', '상하복/실내복'];

    for (final width in [320.0, 360.0, 390.0, 430.0]) {
      await tester.binding.setSurfaceSize(Size(width, 844));
      for (final scale in [1.0, 2.0]) {
        for (final label in labels) {
          await tester.pumpWidget(
            MaterialApp(
              theme: KkokkapickTheme.light(),
              builder: (context, child) => MediaQuery(
                data: MediaQuery.of(context).copyWith(
                  textScaler: TextScaler.linear(scale),
                ),
                child: child!,
              ),
              home: Scaffold(
                body: SafeArea(
                  child: V9CategoryStrip(
                    categories: [label],
                    onSelected: (_) {},
                  ),
                ),
              ),
            ),
          );
          await tester.pump();

          expect(
            tester.takeException(),
            isNull,
            reason: 'category layout exception at width=$width scale=$scale label=$label',
          );
          final paragraph = tester.renderObject<RenderParagraph>(find.text(label));
          expect(
            paragraph.didExceedMaxLines,
            isFalse,
            reason: 'category label truncated at width=$width scale=$scale label=$label',
          );
        }
      }
    }

    await tester.binding.setSurfaceSize(null);
  });
}
