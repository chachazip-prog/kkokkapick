import 'package:flutter/material.dart';
import '../theme/kkokkapick_theme.dart';

/// Production brand mark: a compact clothes-tag symbol paired with the Korean
/// wordmark. It intentionally avoids third-party imagery and remains legible
/// at small mobile sizes.
class KkokkapickBrandMark extends StatelessWidget {
  const KkokkapickBrandMark({super.key,this.compact=false});
  final bool compact;
  @override Widget build(BuildContext context)=>Semantics(
    label:'꼬까픽',header:true,
    child:ExcludeSemantics(child:Row(mainAxisSize:MainAxisSize.min,children:[
      Container(width:compact?28:36,height:compact?28:36,decoration:BoxDecoration(color:KkokkapickTheme.coral,borderRadius:BorderRadius.circular(compact?9:12)),child:Icon(Icons.sell_rounded,size:compact?17:21,color:Colors.white)),
      SizedBox(width:compact?7:9),
      Text('꼬까픽',style:TextStyle(fontSize:compact?20:27,height:1,fontWeight:FontWeight.w900,letterSpacing:-1.1,color:KkokkapickTheme.ink)),
    ])),
  );
}

class KkokkapickLaunchSurface extends StatelessWidget {
  const KkokkapickLaunchSurface({super.key,this.message='우리 아이 옷, 더 쉽게 고르는 방법'});
  final String message;
  @override Widget build(BuildContext context)=>ColoredBox(color:KkokkapickTheme.cream,child:Center(child:Semantics(liveRegion:true,label:'꼬까픽 불러오는 중',child:Column(mainAxisSize:MainAxisSize.min,children:[
    const KkokkapickBrandMark(),const SizedBox(height:14),Text(message,textAlign:TextAlign.center,style:Theme.of(context).textTheme.bodyMedium?.copyWith(color:KkokkapickTheme.muted)),const SizedBox(height:22),const SizedBox(width:22,height:22,child:CircularProgressIndicator(strokeWidth:2.5)),
  ]))));
}
