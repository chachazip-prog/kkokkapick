import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/repositories/child_profile_repository.dart';
import 'package:kkokkapick/services/app_session_orchestrator.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';
import 'package:kkokkapick/widgets/v10_account_page.dart';

void main() {
  Widget app(AppSessionState state) => MaterialApp(
        theme: KkokkapickTheme.light(),
        builder: (context, child) => MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: const TextScaler.linear(2),
          ),
          child: child!,
        ),
        home: V10AccountPage(
          profile: const ChildProfile(months: 8, heightCm: 70, weightKg: 8),
          favoriteCount: 12,
          alertCount: 3,
          sessionState: state,
          sessionConfigured: true,
          sessionBusy: false,
          onEditProfile: () {},
          onFavorites: () {},
          onSearch: () {},
          onSignIn: () async {},
          onSignOut: () async {},
          onDeleteAppData: () async {},
          onDeleteAccount: () async {},
        ),
      );

  Future<void> pumpAtWidth(
    WidgetTester tester,
    double width,
    AppSessionState state,
  ) async {
    await tester.binding.setSurfaceSize(Size(width, 844));
    await tester.pumpWidget(app(state));
    await tester.pump();
  }

  testWidgets('authenticated My survives release widths at 200% text',
      (tester) async {
    for (final width in [320.0, 360.0, 390.0, 430.0]) {
      await pumpAtWidth(tester, width, AppSessionState.authenticated);

      expect(
        tester.takeException(),
        isNull,
        reason: 'authenticated My overflowed at width $width and 200% text',
      );

      await tester.drag(find.byType(ListView), const Offset(0, -620));
      await tester.pumpAndSettle();
      expect(find.text('계정 연결됨'), findsOneWidget);
      expect(find.text('로그아웃'), findsOneWidget);

      await tester.drag(find.byType(ListView), const Offset(0, -760));
      await tester.pumpAndSettle();
      expect(find.text('계정 삭제'), findsOneWidget);
      expect(
        tester.takeException(),
        isNull,
        reason: 'authenticated destructive controls overflowed at width $width',
      );
    }
    await tester.binding.setSurfaceSize(null);
  });

  testWidgets('offline My keeps server deletion unavailable at 320 and 200%',
      (tester) async {
    await pumpAtWidth(tester, 320, AppSessionState.offlineAuthenticated);

    expect(tester.takeException(), isNull);
    expect(
      find.text('오프라인 계정 모드 · 연결 후 다시 동기화할 수 있어요.'),
      findsOneWidget,
    );

    await tester.scrollUntilVisible(
      find.text('이 기기의 꼬까픽 데이터 삭제'),
      300,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();

    expect(find.text('이 기기의 꼬까픽 데이터 삭제'), findsOneWidget);
    expect(find.text('계정 삭제'), findsNothing);
    expect(find.text('계정 삭제는 연결 후 가능해요'), findsOneWidget);
    expect(tester.takeException(), isNull);

    await tester.binding.setSurfaceSize(null);
  });

  testWidgets('privacy and settings sheets survive 320 width at 200% text',
      (tester) async {
    await pumpAtWidth(tester, 320, AppSessionState.authenticated);

    await tester.scrollUntilVisible(
      find.text('개인정보 및 데이터 안내'),
      300,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('개인정보 및 데이터 안내'));
    await tester.pumpAndSettle();

    expect(find.text('개인정보 및 데이터'), findsOneWidget);
    expect(find.text('계정 동기화'), findsOneWidget);
    expect(tester.takeException(), isNull);

    Navigator.of(tester.element(find.text('개인정보 및 데이터'))).pop();
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.text('앱 설정'),
      320,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('앱 설정'));
    await tester.pumpAndSettle();

    expect(find.text('앱 설정'), findsWidgets);
    expect(find.text('동기화 상태'), findsOneWidget);
    expect(tester.takeException(), isNull);

    await tester.binding.setSurfaceSize(null);
  });
}
