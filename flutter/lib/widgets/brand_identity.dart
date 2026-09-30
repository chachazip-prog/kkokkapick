import 'package:flutter/material.dart';
import '../theme/kkokkapick_theme.dart';

/// Product Owner-approved wordmark direction: strong black Korean wordmark
/// with a small warm/pink accent. Avoid generic AI/sparkle app-icon styling.
class KkokkapickBrandMark extends StatelessWidget {
  const KkokkapickBrandMark({super.key,this.compact=false});
  final bool compact;

  @override
  Widget build(BuildContext context)=>Semantics(
    label:'꼬까픽',header:true,
    child:ExcludeSemantics(
      child:Stack(
        clipBehavior:Clip.none,
        children:[
          Text(
            '꼬까픽',
            style:TextStyle(
              fontSize:compact?27:34,
              height:1,
              fontWeight:FontWeight.w900,
              letterSpacing:-2.2,
              color:const Color(0xFF17171B),
            ),
          ),
          Positioned(
            right:compact?-8:-10,
            top:compact?-5:-7,
            child:Transform.rotate(
              angle:.18,
              child:Icon(
                Icons.favorite_rounded,
                size:compact?11:14,
                color:const Color(0xFFFF8FA3),
              ),
            ),
          ),
        ],
      ),
    ),
  );
}

class KkokkapickLaunchSurface extends StatelessWidget {
  const KkokkapickLaunchSurface({super.key,this.message='우리 아이 옷, 더 쉽게 고르는 방법'});
  final String message;
  @override Widget build(BuildContext context)=>DecoratedBox(
    decoration:const BoxDecoration(
      gradient:LinearGradient(
        begin:Alignment.topCenter,end:Alignment.bottomCenter,
        colors:[KkokkapickTheme.lavenderSoft,KkokkapickTheme.cream],
      ),
    ),
    child:Center(
      child:Semantics(
        liveRegion:true,label:'꼬까픽 불러오는 중',
        child:Column(
          mainAxisSize:MainAxisSize.min,
          children:[
            const KkokkapickBrandMark(),
            const SizedBox(height:14),
            Text(message,textAlign:TextAlign.center,style:Theme.of(context).textTheme.bodyMedium?.copyWith(color:KkokkapickTheme.muted)),
            const SizedBox(height:22),
            const SizedBox(width:22,height:22,child:CircularProgressIndicator(strokeWidth:2.5)),
          ],
        ),
      ),
    ),
  );
}
