import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';

void main(){
  test('release theme keeps lavender brand accents on a neutral commerce surface',(){
    final theme=KkokkapickTheme.light();
    expect(KkokkapickTheme.lavender,const Color(0xFF7567D8));
    expect(KkokkapickTheme.lavenderDeep,const Color(0xFF5146A6));
    expect(KkokkapickTheme.lavenderSoft,const Color(0xFFF0EDFF));
    expect(KkokkapickTheme.cream,const Color(0xFFFFFFFF));
    expect(theme.colorScheme.primary,isNot(const Color(0xFFE95D45)));
    expect(theme.filledButtonTheme.style?.backgroundColor?.resolve(<WidgetState>{}),KkokkapickTheme.lavenderDeep);
    expect(theme.navigationBarTheme.height,greaterThanOrEqualTo(64));
    expect(theme.navigationBarTheme.indicatorColor,KkokkapickTheme.lavenderSoft);
    expect(theme.useMaterial3,isTrue);
    expect(theme.inputDecorationTheme.filled,isTrue);
    expect(theme.cardTheme.elevation,0);
  });
}
