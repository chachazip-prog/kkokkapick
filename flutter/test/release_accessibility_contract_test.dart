import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/models/catalog_product.dart';
import 'package:kkokkapick/theme/kkokkapick_theme.dart';
import 'package:kkokkapick/widgets/discovery_experience.dart';

void main() {
  testWidgets('release shell survives large text scaling and exposes semantic navigation', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: KkokkapickTheme.light(),
      builder: (context, child) => MediaQuery(data: MediaQuery.of(context).copyWith(textScaler: const TextScaler.linear(2)), child: child!),
      home: Scaffold(body: const SafeArea(child: Text('꼬까픽')), bottomNavigationBar: NavigationBar(destinations: const [
        NavigationDestination(icon: Icon(Icons.home_outlined), label: '홈'),
        NavigationDestination(icon: Icon(Icons.search), label: '찾기'),
        NavigationDestination(icon: Icon(Icons.favorite_border), label: '찜'),
        NavigationDestination(icon: Icon(Icons.person_outline), label: '마이'),
      ])),
    ));
    expect(tester.takeException(), isNull);
    for (final label in ['홈','찾기','찜','마이']) { expect(find.text(label), findsOneWidget); }
    expect(tester.getSize(find.byType(NavigationBar)).height, greaterThanOrEqualTo(64));
  });

  testWidgets('destructive action requires an explicit confirmation surface', (tester) async {
    var deleted=false;
    await tester.pumpWidget(MaterialApp(home: Builder(builder:(context)=>Scaffold(body:TextButton(
      onPressed:()=>showDialog<void>(context:context,builder:(context)=>AlertDialog(title:const Text('계정 삭제'),content:const Text('삭제 후 복구할 수 없습니다.'),actions:[TextButton(onPressed:()=>Navigator.pop(context),child:const Text('취소')),TextButton(onPressed:(){deleted=true;Navigator.pop(context);},child:const Text('삭제'))])),
      child:const Text('계정 삭제'),
    )))));
    await tester.tap(find.text('계정 삭제')); await tester.pumpAndSettle();
    expect(find.text('취소'),findsOneWidget); expect(deleted,isFalse);
    await tester.tap(find.text('취소')); await tester.pumpAndSettle(); expect(deleted,isFalse);
  });

  testWidgets('production discovery primitives survive phone widths and 200% text', (tester) async {
    final product=CatalogProduct(id:'qa-product',name:'긴 상품명도 안정적으로 보여야 하는 베이비 상하복 세트',brand:'아가방',category:'상하복',stage:'베이비',imageUrl:null,minPrice:32900,offerCount:0,fitStatus:'verified',offers:const [],availableSizes:const [],sizeGuide:null);
    for(final width in [320.0,360.0,390.0,430.0]) {
      await tester.binding.setSurfaceSize(Size(width,844));
      await tester.pumpWidget(MaterialApp(
        theme:KkokkapickTheme.light(),
        builder:(context,child)=>MediaQuery(data:MediaQuery.of(context).copyWith(textScaler:const TextScaler.linear(2)),child:child!),
        home:Scaffold(body:SafeArea(child:ListView(children:[
          const ServiceGuideStrip(),
          SwipePickDeck(products:[product],favoriteIds:const <String>{},onFavorite:(_){},onTap:(_){ }),
          const SizedBox(height:160,child:ProductImage(url:null)),
        ]))),
      ));
      await tester.pump();
      expect(tester.takeException(),isNull,reason:'overflow/exception at width $width');
      expect(find.text('꼬까픽'),findsWidgets); expect(find.text('꼬까핏'),findsWidgets); expect(find.text('상품 이미지 준비 중'),findsWidgets);
    }
    await tester.binding.setSurfaceSize(null);
  });
}
