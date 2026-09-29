import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';
import 'package:kkokkapick/widgets/brand_identity.dart';

void main(){
 testWidgets('brand mark remains semantic and launch surface handles large text',(tester)async{
  final semantics=tester.ensureSemantics();
  await tester.binding.setSurfaceSize(const Size(320,700));
  await tester.pumpWidget(MaterialApp(theme:KkokkapickTheme.light(),builder:(context,child)=>MediaQuery(data:MediaQuery.of(context).copyWith(textScaler:const TextScaler.linear(2)),child:child!),home:const Scaffold(body:KkokkapickLaunchSurface())));
  expect(tester.takeException(),isNull);
  expect(find.bySemanticsLabel(RegExp('꼬까픽')),findsWidgets);
  expect(find.text('우리 아이 옷, 더 쉽게 고르는 방법'),findsOneWidget);
  await tester.binding.setSurfaceSize(null);
  semantics.dispose();
 });
}
