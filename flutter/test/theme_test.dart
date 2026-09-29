import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';

void main(){
  test('mobile theme keeps accessible navigation sizing',(){
    final theme=KkokkapickTheme.light();
    expect(theme.navigationBarTheme.height,greaterThanOrEqualTo(64));
    expect(theme.useMaterial3,isTrue);
  });
}
