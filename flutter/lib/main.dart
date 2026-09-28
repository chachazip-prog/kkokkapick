import 'package:flutter/material.dart';

void main()=>runApp(const KkokkapickApp());

class KkokkapickApp extends StatelessWidget {
  const KkokkapickApp({super.key});
  @override
  Widget build(BuildContext context)=>MaterialApp(
    title:'꼬까픽',
    debugShowCheckedModeBanner:false,
    theme:ThemeData(useMaterial3:true),
    home:const Scaffold(body:SafeArea(child:Center(child:Text('꼬까픽\n우리 아이 옷, 한곳에서.',textAlign:TextAlign.center)))),
  );
}
