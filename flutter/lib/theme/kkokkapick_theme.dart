import 'package:flutter/material.dart';

abstract final class KkokkapickTheme {
  static const coral=Color(0xFFFF6B4A);
  static const ink=Color(0xFF202124);
  static const muted=Color(0xFF6F7378);
  static const surface=Color(0xFFF7F7F5);
  static const fit=Color(0xFFECF7F1);

  static ThemeData light()=>ThemeData(
    useMaterial3:true,
    scaffoldBackgroundColor:Colors.white,
    colorScheme:ColorScheme.fromSeed(seedColor:coral,brightness:Brightness.light,surface:Colors.white),
    appBarTheme:const AppBarTheme(backgroundColor:Colors.white,foregroundColor:ink,elevation:0,scrolledUnderElevation:0),
    navigationBarTheme:NavigationBarThemeData(
      height:66,
      backgroundColor:Colors.white,
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
    cardTheme:CardThemeData(color:Colors.white,elevation:0,shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(16),side:const BorderSide(color:Color(0xFFEEEEEB)))),
  );
}
