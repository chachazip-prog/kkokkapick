import '../models/catalog_product.dart';
import '../repositories/child_profile_repository.dart';

class FitResult {
  const FitResult(this.status,this.label);
  final String status,label;
}

class KkokkafitEngine {
  const KkokkafitEngine();

  // Only first-party verified charts belong here. Numeric tokens in product names are never evidence.
  static const _charts=<String,List<_SizeRow>>{
    '아가방':[
      _SizeRow('60',3,6,60,8.4),_SizeRow('75',7,10,72,10.3),_SizeRow('80',9,12,76,null),
      _SizeRow('90',12,24,84,12.8),_SizeRow('100',36,36,92,13.7),_SizeRow('110',48,48,101,15.7),
      _SizeRow('120',60,60,110,19.7),_SizeRow('130',72,72,119,23.6)
    ],
    '에뜨와':[
      _SizeRow('70',0,3,64,null),_SizeRow('75',3,6,70,null),_SizeRow('80',6,12,74,null),
      _SizeRow('90',12,24,80,null),_SizeRow('100',24,36,87,null),_SizeRow('3Y',36,48,95,null),
      _SizeRow('4Y',36,48,105,null)
    ]
  };

  FitResult evaluate(ChildProfile? profile,CatalogProduct product){
    if(profile==null)return const FitResult('profile_required','아이 정보가 더 필요해요');
    final rows=_charts[product.brand];
    if(product.fitStatus!='verified'||rows==null)return const FitResult('insufficient_product_data','사이즈 정보 확인 필요');
    final ranked=[...rows]..sort((a,b)=>_score(a,profile).compareTo(_score(b,profile)));
    return FitResult('recommended','${ranked.first.size} 우선 확인');
  }

  double _score(_SizeRow r,ChildProfile p){
    var s=(p.heightCm-r.height).abs();
    if(r.weight!=null)s+=(p.weightKg-r.weight!).abs()*1.5;
    if(p.months<r.lo)s+=(r.lo-p.months)*.6;
    if(p.months>r.hi)s+=(p.months-r.hi)*.6;
    return s;
  }
}
class _SizeRow {
  const _SizeRow(this.size,this.lo,this.hi,this.height,this.weight);
  final String size;final int lo,hi;final double height;final double? weight;
}
