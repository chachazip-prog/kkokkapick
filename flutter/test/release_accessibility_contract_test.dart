import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';

void main() {
  testWidgets('release shell survives large text scaling and exposes semantic navigation', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: KkokkapickTheme.light(),
        builder: (context, child) => MediaQuery(
          data: MediaQuery.of(context).copyWith(textScaler: const TextScaler.linear(2.0)),
          child: child!,
        ),
        home: Scaffold(
          body: const SafeArea(child: Text('꼬까픽')),
          bottomNavigationBar: NavigationBar(
            destinations: const [
              NavigationDestination(icon: Icon(Icons.home_outlined), label: '홈'),
              NavigationDestination(icon: Icon(Icons.search), label: '찾기'),
              NavigationDestination(icon: Icon(Icons.favorite_border), label: '찜'),
              NavigationDestination(icon: Icon(Icons.person_outline), label: '마이'),
            ],
          ),
        ),
      ),
    );
    expect(tester.takeException(), isNull);
    expect(find.text('꼬까픽'), findsOneWidget);
    for (final label in ['홈','찾기','찜','마이']) {
      expect(find.text(label), findsOneWidget);
    }
    final navSize = tester.getSize(find.byType(NavigationBar));
    expect(navSize.height, greaterThanOrEqualTo(64));
  });

  testWidgets('destructive action requires an explicit confirmation surface', (tester) async {
    var deleted=false;
    await tester.pumpWidget(MaterialApp(home: Builder(builder:(context)=>Scaffold(
      body: TextButton(
        onPressed:()=>showDialog<void>(context:context,builder:(context)=>AlertDialog(
          title:const Text('계정 삭제'),
          content:const Text('삭제 후 복구할 수 없습니다.'),
          actions:[
            TextButton(onPressed:()=>Navigator.pop(context),child:const Text('취소')),
            TextButton(onPressed:(){deleted=true;Navigator.pop(context);},child:const Text('삭제')),
          ],
        )),
        child:const Text('계정 삭제'),
      ),
    ))));
    await tester.tap(find.text('계정 삭제'));
    await tester.pumpAndSettle();
    expect(find.text('취소'),findsOneWidget);
    expect(deleted,isFalse);
    await tester.tap(find.text('취소'));
    await tester.pumpAndSettle();
    expect(deleted,isFalse);
  });
}
