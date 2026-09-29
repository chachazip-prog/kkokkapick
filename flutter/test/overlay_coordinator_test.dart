import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/services/overlay_coordinator.dart';

void main(){
  test('only one overlay can own the screen',(){
    final c=OverlayCoordinator();
    expect(c.begin(OverlayKind.userModal),isTrue);
    expect(c.begin(OverlayKind.managedPopup),isFalse);
    c.end(OverlayKind.userModal);
    expect(c.begin(OverlayKind.managedPopup),isTrue);
  });
}
