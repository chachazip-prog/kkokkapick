import 'package:flutter/material.dart';

abstract final class KkokkapickTheme {
  static const coral=Color(0xFFE95D45);
  static const ink=Color(0xFF202124);
  static const muted=Color(0xFF6F7378);
  static const surface=Color(0xFFF7F5F0);
  static const fit=Color(0xFFEAF5EF);
  static const cream=Color(0xFFFFFBF5);

  static ThemeData light()=>ThemeData(
    useMaterial3:true,
    scaffoldBackgroundColor:cream,
    fontFamilyFallback:const ['Apple SD Gothic Neo','Noto Sans KR'],
    colorScheme:ColorScheme.fromSeed(seedColor:coral,brightness:Brightness.light,surface:Colors.white),
    appBarTheme:const AppBarTheme(backgroundColor:cream,foregroundColor:ink,elevation:0,scrolledUnderElevation:0),
    navigationBarTheme:NavigationBarThemeData(
      height:66,
      backgroundColor:cream,
      indicatorColor:coral.withValues(alpha:.12),
      labelTextStyle:WidgetStateProperty.resolveWith((s)=>TextStyle(fontSize:12,fontWeight:s.contains(WidgetState.selected)?FontWeight.w700:FontWeight.w500)),
    ),
    inputDecorationTheme:InputDecorationTheme(
      filled:true,fillColor:surface,
      border:OutlineInputBorder(borderSide:BorderSide.none,borderRadius:BorderRadius.circular(14)),
      enabledBorder:OutlineInputBorder(borderSide:BorderSide.none,borderRadius:BorderRadius.circular(14)),
      contentPadding:const EdgeInsets.symmetric(horizontal:14,vertical:13),
    ),
    chipTheme:ChipThemeData(shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(12)),side:BorderSide.none),
    cardTheme:CardThemeData(color:Colors.white,elevation:0,shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(22),side:const BorderSide(color:Color(0xFFEAE6DE)))),
  );
}
