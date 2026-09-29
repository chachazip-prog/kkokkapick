import 'package:flutter/material.dart';

abstract final class KkokkaSpacing {
  static const double xs=4, sm=8, md=12, lg=16, xl=24, xxl=32;
}

abstract final class KkokkaRadius {
  static const double chip=12, card=16, sheet=24;
}

ThemeData buildKkokkaTheme(){
  const seed=Color(0xFFFF6B4A);
  final scheme=ColorScheme.fromSeed(seedColor:seed,brightness:Brightness.light,surface:Colors.white);
  return ThemeData(
    useMaterial3:true,
    colorScheme:scheme,
    scaffoldBackgroundColor:const Color(0xFFFAFAF8),
    appBarTheme:const AppBarTheme(backgroundColor:Color(0xFFFAFAF8),surfaceTintColor:Colors.transparent,elevation:0),
    inputDecorationTheme:InputDecorationTheme(
      filled:true,
      fillColor:Colors.white,
      border:OutlineInputBorder(borderSide:BorderSide.none,borderRadius:BorderRadius.circular(KkokkaRadius.card)),
      contentPadding:const EdgeInsets.symmetric(horizontal:KkokkaSpacing.lg,vertical:14),
    ),
    cardTheme:CardThemeData(
      elevation:0,
      margin:EdgeInsets.zero,
      color:Colors.white,
      shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(KkokkaRadius.card)),
    ),
    chipTheme:ChipThemeData(
      side:const BorderSide(color:Color(0xFFE9E8E4)),
      shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(KkokkaRadius.chip)),
      backgroundColor:Colors.white,
      selectedColor:const Color(0xFFFFE8E1),
      padding:const EdgeInsets.symmetric(horizontal:4),
    ),
    filledButtonTheme:FilledButtonThemeData(style:FilledButton.styleFrom(minimumSize:const Size(48,48),shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(14)))),
  );
}
