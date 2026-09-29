import 'package:flutter/material.dart';

abstract final class KkokkapickTheme {
  static const lavender=Color(0xFF7567D8);
  static const lavenderDeep=Color(0xFF5146A6);
  static const lavenderSoft=Color(0xFFF0EDFF);
  static const blush=Color(0xFFFFEEF4);
  static const ink=Color(0xFF25232B);
  static const muted=Color(0xFF77737F);
  static const surface=Color(0xFFF7F6FA);
  static const fit=Color(0xFFEFF8F3);
  static const cream=Color(0xFFFFFFFF);
  static const coral=lavender;

  static ThemeData light()=>ThemeData(
    useMaterial3:true,
    scaffoldBackgroundColor:cream,
    fontFamilyFallback:const ['Pretendard','Apple SD Gothic Neo','Noto Sans KR'],
    colorScheme:ColorScheme.fromSeed(seedColor:lavender,brightness:Brightness.light,surface:Colors.white),
    textTheme:const TextTheme(
      headlineSmall:TextStyle(letterSpacing:-.8,height:1.18,color:ink),
      titleLarge:TextStyle(letterSpacing:-.55,color:ink),
      titleMedium:TextStyle(letterSpacing:-.35,color:ink),
      bodyLarge:TextStyle(letterSpacing:-.2,color:ink),
      bodyMedium:TextStyle(letterSpacing:-.15,color:ink),
    ),
    appBarTheme:const AppBarTheme(backgroundColor:cream,foregroundColor:ink,elevation:0,scrolledUnderElevation:0),
    navigationBarTheme:NavigationBarThemeData(
      height:64,backgroundColor:Colors.white,indicatorColor:lavenderSoft,
      labelTextStyle:WidgetStateProperty.resolveWith((s)=>TextStyle(fontSize:12,color:s.contains(WidgetState.selected)?lavenderDeep:ink,fontWeight:s.contains(WidgetState.selected)?FontWeight.w800:FontWeight.w500)),
      iconTheme:WidgetStateProperty.resolveWith((s)=>IconThemeData(color:s.contains(WidgetState.selected)?lavenderDeep:ink)),
    ),
    filledButtonTheme:FilledButtonThemeData(style:FilledButton.styleFrom(backgroundColor:lavenderDeep,foregroundColor:Colors.white,padding:const EdgeInsets.symmetric(horizontal:20,vertical:14),shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(10)))),
    inputDecorationTheme:InputDecorationTheme(
      filled:true,fillColor:surface,
      border:OutlineInputBorder(borderSide:BorderSide.none,borderRadius:BorderRadius.circular(10)),
      enabledBorder:OutlineInputBorder(borderSide:BorderSide.none,borderRadius:BorderRadius.circular(10)),
      focusedBorder:OutlineInputBorder(borderSide:const BorderSide(color:lavender,width:1.2),borderRadius:BorderRadius.circular(10)),
      contentPadding:const EdgeInsets.symmetric(horizontal:16,vertical:14),
    ),
    chipTheme:ChipThemeData(backgroundColor:Colors.white,selectedColor:lavenderSoft,labelStyle:const TextStyle(color:ink),shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(999)),side:const BorderSide(color:Color(0xFFECE9F2))),
    cardTheme:CardThemeData(color:Colors.white,elevation:0,shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(12),side:const BorderSide(color:Color(0xFFEDEAF2)))),
  );
}
