import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/repositories/child_profile_repository.dart';
import 'package:kkokkapick/services/app_session_orchestrator.dart';
import 'package:kkokkapick/services/overlay_coordinator.dart';
import 'package:kkokkapick/widgets/v10_account_page.dart';

void main() {
  Widget app({
    AppSessionState state = AppSessionState.guest,
    bool configured = true,
    OverlayCoordinator? overlayCoordinator,
  }) {
    return MaterialApp(
      home: V10AccountPage(
        profile: const ChildProfile(months: 8, heightCm: 70, weightKg: 8),
        favoriteCount: 2,
        alertCount: 1,
        sessionState: state,
        sessionConfigured: configured,
        sessionBusy: false,
        onEditProfile: () {},
        onFavorites: () {},
        onSearch: () {},
        onSignIn: () async {},
        onSignOut: () async {},
        onDeleteAppData: () async {},
        onDeleteAccount: () async {},
        overlayCoordinator: overlayCoordinator,
      ),
    );
  }

  Future<void> revealAndTap(WidgetTester tester, Finder finder) async {
    await tester.scrollUntilVisible(
      finder,
      260,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.ensureVisible(finder);
    await tester.pumpAndSettle();
    await tester.tap(finder);
    await tester.pumpAndSettle();
  }

  testWidgets('guest preview does not expose fake login when auth is unconfigured',
      (tester) async {
    await tester.pumpWidget(app(configured: false));
    expect(find.text('로그인은 아직 사용할 수 없어요'), findsOneWidget);
    expect(find.text('로그인 / 계정 만들기'), findsNothing);
    expect(find.text('계정 삭제'), findsNothing);
  });

  testWidgets('authenticated account exposes sign out and destructive controls',
      (tester) async {
    await tester.pumpWidget(app(state: AppSessionState.authenticated));
    expect(find.text('계정 연결됨'), findsOneWidget);
    expect(find.text('로그아웃'), findsOneWidget);
    expect(find.text('꼬까픽 데이터 삭제'), findsOneWidget);
    expect(find.text('계정 삭제'), findsOneWidget);
  });

  testWidgets('offline authenticated state keeps destructive server action disabled',
      (tester) async {
    await tester.pumpWidget(app(state: AppSessionState.offlineAuthenticated));
    expect(find.text('계정 연결 대기 중'), findsOneWidget);
    expect(find.textContaining('오래된 토큰은 사용하지 않아요'), findsOneWidget);
    expect(find.text('오프라인 계정 모드 · 연결 후 다시 동기화할 수 있어요.'), findsOneWidget);
    expect(find.textContaining('연결되면 다시 동기화해요'), findsNothing);
    await tester.scrollUntilVisible(
      find.text('이 기기의 꼬까픽 데이터 삭제'),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('이 기기의 꼬까픽 데이터 삭제'), findsOneWidget);
    expect(find.text('계정 삭제'), findsNothing);
    expect(find.text('계정 삭제는 연결 후 가능해요'), findsOneWidget);
  });

  testWidgets('price alert stat is informational until dedicated management exists', (tester) async {
    await tester.pumpWidget(app());
    final label = find.text('가격 다운 알림');
    expect(label, findsOneWidget);
    final ink = find.ancestor(of: label, matching: find.byType(InkWell));
    expect(ink, findsOneWidget);
    expect(tester.widget<InkWell>(ink).onTap, isNull);
    expect(find.text('상품 상세에서 관리'), findsOneWidget);
  });

  testWidgets('privacy and data entry opens a real explanatory surface', (tester) async {
    await tester.pumpWidget(app());
    await revealAndTap(tester, find.text('개인정보 및 데이터 안내'));

    expect(find.text('개인정보 및 데이터'), findsOneWidget);
    expect(find.text('기기에 저장되는 정보'), findsOneWidget);
    expect(find.text('계정 동기화'), findsOneWidget);
    expect(find.text('개인정보처리방침'), findsOneWidget);
  });

  testWidgets('app settings entry opens current operational settings surface', (tester) async {
    await tester.pumpWidget(app(state: AppSessionState.offlineAuthenticated));
    await revealAndTap(tester, find.text('앱 설정'));

    expect(find.text('계정 기능'), findsOneWidget);
    expect(find.text('기기 데이터'), findsOneWidget);
    expect(find.text('동기화 상태'), findsOneWidget);
    expect(find.textContaining('오래된 토큰'), findsOneWidget);
  });

  testWidgets('My sheets honor the shared overlay coordinator', (tester) async {
    final coordinator = OverlayCoordinator();
    expect(coordinator.begin(OverlayKind.managedPopup), isTrue);
    await tester.pumpWidget(app(overlayCoordinator: coordinator));

    await tester.scrollUntilVisible(
      find.text('앱 설정'),
      320,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('앱 설정'));
    await tester.pumpAndSettle();
    expect(find.text('계정 기능'), findsNothing);

    coordinator.end(OverlayKind.managedPopup);
    await tester.tap(find.text('앱 설정'));
    await tester.pumpAndSettle();
    expect(find.text('계정 기능'), findsOneWidget);

    Navigator.of(tester.element(find.text('계정 기능'))).pop();
    await tester.pumpAndSettle();
    expect(coordinator.active, OverlayKind.none);
  });

  testWidgets('customer support remains visibly unavailable until official channel exists',
      (tester) async {
    await tester.pumpWidget(app());
    await tester.scrollUntilVisible(
      find.text('고객지원'),
      320,
      scrollable: find.byType(Scrollable).first,
    );

    final tile = tester.widget<ListTile>(
      find.ancestor(of: find.text('고객지원'), matching: find.byType(ListTile)),
    );
    expect(tile.enabled, isFalse);
    expect(tile.onTap, isNull);
    expect(find.text('공식 운영 주체와 고객지원 채널 확정 후 제공됩니다.'), findsOneWidget);
  });
}
