import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/repositories/child_profile_repository.dart';
import 'package:kkokkapick/services/app_session_orchestrator.dart';
import 'package:kkokkapick/widgets/v10_account_page.dart';

void main() {
  Widget app({
    AppSessionState state = AppSessionState.guest,
    bool configured = true,
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
      ),
    );
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
    expect(find.text('이 기기의 꼬까픽 데이터 삭제'), findsOneWidget);
    expect(find.text('계정 삭제'), findsNothing);
    expect(find.text('계정 삭제는 연결 후 가능해요'), findsOneWidget);
  });
}
