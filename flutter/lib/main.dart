import 'package:flutter/material.dart';

import 'app/approved_app.dart';
import 'theme/kkokkapick_theme.dart';

void main() => runApp(const KkokkapickApp());

class KkokkapickApp extends StatelessWidget {
  const KkokkapickApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: '꼬까픽',
        debugShowCheckedModeBanner: false,
        theme: KkokkapickTheme.light(),
        home: const ApprovedCatalogApp(),
      );
}
