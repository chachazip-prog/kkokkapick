import 'package:shared_preferences/shared_preferences.dart';

class ChildProfile {
  const ChildProfile({required this.months,required this.heightCm,required this.weightKg});
  final int months;
  final double heightCm,weightKg;
  String get stage=>months<4?'신생아':months<24?'베이비':months<48?'유아':months<72?'토들러':'키즈';
}

class ChildProfileRepository {
  Future<ChildProfile?> load() async {
    final p=await SharedPreferences.getInstance();
    final m=p.getInt('child_months'),h=p.getDouble('child_height'),w=p.getDouble('child_weight');
    return m!=null&&m>0&&h!=null&&h>0&&w!=null&&w>0?ChildProfile(months:m,heightCm:h,weightKg:w):null;
  }
  Future<void> save(ChildProfile v) async {
    final p=await SharedPreferences.getInstance();
    await p.setInt('child_months',v.months);
    await p.setDouble('child_height',v.heightCm);
    await p.setDouble('child_weight',v.weightKg);
  }
}
